import SwiftUI

struct ContentView: View {
    @StateObject private var workoutManager = WorkoutManager()
    
    var body: some View {
        if workoutManager.showingPauseResume {
            runningView
        } else {
            startView
        }
    }
    
    var startView: some View {
        VStack(spacing: 20) {
            Text("Stride Seeker")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.blue)
            
            Button("Iniciar") {
                print("Iniciar button pressed")
                DispatchQueue.main.async {
                    workoutManager.showingPauseResume = true
                }
                workoutManager.startWorkout()
            }
            .font(.title2)
            .padding()
            .background(Color.green)
            .foregroundColor(.white)
            .cornerRadius(15)
        }
        .padding()
    }
    
    var runningView: some View {
        VStack(spacing: 15) {
            // Cronómetro
            Text(formatTime(workoutManager.elapsedTime))
                .font(.system(.title, design: .monospaced))
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            // Métricas en fila
            HStack(spacing: 20) {
                VStack {
                    Text(String(format: "%.0f m", workoutManager.distance))
                        .font(.system(.headline, design: .monospaced))
                        .fontWeight(.semibold)
                    Text("Distancia")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                VStack {
                    Text(String(format: "%.1f", workoutManager.pace))
                        .font(.system(.headline, design: .monospaced))
                        .fontWeight(.semibold)
                    Text("Ritmo")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            // Métricas adicionales
            HStack(spacing: 20) {
                VStack {
                    Text(String(format: "%.0f bpm", workoutManager.heartRate))
                        .font(.system(.caption, design: .monospaced))
                        .fontWeight(.medium)
                    Text("FC")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                
                VStack {
                    Text(String(format: "%.0f cal", workoutManager.calories))
                        .font(.system(.caption, design: .monospaced))
                        .fontWeight(.medium)
                    Text("Calorías")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            // Botones de control
            VStack(spacing: 10) {
                if workoutManager.running {
                    Button("Pausar") {
                        workoutManager.pauseWorkout()
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                } else {
                    Button("Reanudar") {
                        workoutManager.resumeWorkout()
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(10)
                }
                
                Button("Finalizar") {
                    workoutManager.endWorkout()
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 8)
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
        .padding()
    }
    
    private func formatTime(_ timeInterval: TimeInterval) -> String {
        let totalSeconds = Int(timeInterval)
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
