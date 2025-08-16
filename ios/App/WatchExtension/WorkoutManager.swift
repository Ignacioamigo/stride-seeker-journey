import Foundation
import HealthKit
import CoreLocation
import WatchConnectivity

class WorkoutManager: NSObject, ObservableObject {
    let healthStore = HKHealthStore()
    let locationManager = CLLocationManager()
    
    var session: HKWorkoutSession?
    var builder: HKLiveWorkoutBuilder?
    
    @Published var running = false
    @Published var elapsedTime: TimeInterval = 0
    @Published var distance: Double = 0
    @Published var pace: Double = 0
    @Published var heartRate: Double = 0
    @Published var calories: Double = 0
    @Published var showingPauseResume = false
    
    let selectedWorkout: HKWorkoutActivityType = .running
    
    private var startTime: Date?
    private var timer: Timer?
    private var gpsPoints: [CLLocation] = []
    
    override init() {
        super.init()
        requestPermission()
    }
    
    func requestPermission() {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        let shareTypes: Set<HKSampleType> = []  // solo lectura
        let readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!
        ]

        healthStore.requestAuthorization(toShare: shareTypes, read: readTypes) { _, _ in }
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startWorkout() {
        print("startWorkout() called")
        
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = selectedWorkout
        configuration.locationType = .outdoor

        do {
            session = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
            builder = session?.associatedWorkoutBuilder()
            print("HealthKit session and builder created successfully")
        } catch {
            print("Error creating HealthKit session: \(error)")
            return
        }

        builder?.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore,
                                                     workoutConfiguration: configuration)

        session?.delegate = self
        builder?.delegate = self

        let startDate = Date()
        print("Starting workout at: \(startDate)")
        
        // Set start time immediately in main thread
        DispatchQueue.main.async {
            self.startTime = startDate
            self.running = true
            self.elapsedTime = 0
            print("State updated: running=\(self.running), startTime set")
        }
        
        session?.startActivity(with: startDate)
        builder?.beginCollection(withStart: startDate) { (success, error) in
            if let error = error {
                print("Error starting workout collection: \(error)")
            } else {
                print("Workout collection started successfully")
            }
        }
        
        // Start location tracking
        locationManager.startUpdatingLocation()
        print("Location tracking started")
        
        // Start timer for updating elapsed time every second
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.updateElapsedTime()
        }
        print("Timer started")
    }
    
    func pauseWorkout() {
        session?.pause()
        timer?.invalidate()
        timer = nil
        DispatchQueue.main.async {
            self.running = false
        }
    }
    
    func resumeWorkout() {
        session?.resume()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.updateElapsedTime()
        }
        DispatchQueue.main.async {
            self.running = true
        }
    }
    
    func endWorkout() {
        session?.end()
        timer?.invalidate()
        timer = nil
        DispatchQueue.main.async {
            self.running = false
            self.showingPauseResume = false
        }
        
        // Send workout data to iPhone
        sendWorkoutDataToPhone()
    }
    
    func updateElapsedTime() {
        guard let startTime = startTime else { 
            print("updateElapsedTime: startTime is nil")
            return 
        }
        
        let currentElapsed = Date().timeIntervalSince(startTime)
        print("updateElapsedTime: \(currentElapsed) seconds")
        
        DispatchQueue.main.async {
            self.elapsedTime = currentElapsed
            self.calculatePace()
        }
    }
    
    private func calculatePace() {
        if distance > 0 && elapsedTime > 0 {
            pace = (elapsedTime / 60) / (distance / 1000)
        }
    }
    
    private func sendWorkoutDataToPhone() {
        guard WCSession.default.isReachable else { return }
        
        let workoutData: [String: Any] = [
            "distance": distance,
            "duration": elapsedTime,
            "startTime": startTime?.timeIntervalSince1970 ?? 0,
            "gpsPoints": gpsPoints.map { location in
                [
                    "latitude": location.coordinate.latitude,
                    "longitude": location.coordinate.longitude,
                    "timestamp": location.timestamp.timeIntervalSince1970
                ]
            }
        ]
        
        WCSession.default.sendMessage(workoutData, replyHandler: nil, errorHandler: { error in
            print("Error sending workout data: \(error)")
        })
    }
}

extension WorkoutManager: HKWorkoutSessionDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState,
                       from fromState: HKWorkoutSessionState, date: Date) {
        print("Workout session state changed to: \(toState.rawValue)")
    }
    
    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("Workout session failed: \(error)")
    }
}

extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
        // Handle workout events
    }
    
    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        for type in collectedTypes {
            guard let quantityType = type as? HKQuantityType else { return }
            
            let statistics = workoutBuilder.statistics(for: quantityType)
            
            DispatchQueue.main.async {
                switch quantityType {
                case HKQuantityType.quantityType(forIdentifier: .heartRate):
                    let heartRateUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
                    self.heartRate = statistics?.mostRecentQuantity()?.doubleValue(for: heartRateUnit) ?? 0
                    
                case HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned):
                    let energyUnit = HKUnit.kilocalorie()
                    self.calories = statistics?.sumQuantity()?.doubleValue(for: energyUnit) ?? 0
                    
                case HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning):
                    let meterUnit = HKUnit.meter()
                    self.distance = statistics?.sumQuantity()?.doubleValue(for: meterUnit) ?? 0
                    
                default:
                    return
                }
            }
        }
    }
}
