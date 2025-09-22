import SwiftUI
import StoreKit

struct PaywallView: View {
    @StateObject private var storeManager = StoreManager()
    @Environment(\.presentationMode) var presentationMode
    @State private var selectedProduct: Product?
    @State private var showRestoreAlert = false
    @State private var restoreMessage = ""
    @State private var animateGradient = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header with close and restore buttons
                    headerView
                    
                    // Progress indicator
                    progressView
                    
                    // Main title
                    titleView
                    
                    // Timeline section
                    timelineView
                    
                    // Pricing cards
                    pricingCardsView
                    
                    // No payment due now
                    noPaymentView
                    
                    // CTA Button
                    ctaButtonView
                    
                    // Footer links
                    footerLinksView
                    
                    Spacer(minLength: 20)
                }
                .padding(.horizontal, 20)
            }
            .background(
                LinearGradient(
                    colors: [
                        Color(.systemBackground),
                        Color(.systemGray6).opacity(0.3)
                    ],
                    startPoint: animateGradient ? .topLeading : .topTrailing,
                    endPoint: animateGradient ? .bottomTrailing : .bottomLeading
                )
                .ignoresSafeArea()
                .animation(.easeInOut(duration: 3).repeatForever(autoreverses: true), value: animateGradient)
            )
        }
        .navigationBarHidden(true)
        .onAppear {
            animateGradient = true
            Task {
                await storeManager.loadProducts()
                if !storeManager.products.isEmpty {
                    selectedProduct = storeManager.products.first { $0.id == StoreManager.yearlyProductID }
                        ?? storeManager.products.first
                }
            }
        }
        .alert("Restaurar compras", isPresented: $showRestoreAlert) {
            Button("OK") { }
        } message: {
            Text(restoreMessage)
        }
    }
    
    // MARK: - Header View
    private var headerView: some View {
        HStack {
            Button(action: { presentationMode.wrappedValue.dismiss() }) {
                Image(systemName: "xmark")
                    .font(.title2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button("Restore") {
                Task {
                    await storeManager.restorePurchases()
                    if storeManager.hasActiveSubscription() {
                        restoreMessage = NSLocalizedString("Purchases restored successfully", comment: "")
                        presentationMode.wrappedValue.dismiss()
                    } else {
                        restoreMessage = NSLocalizedString("No purchases found to restore", comment: "")
                    }
                    showRestoreAlert = true
                }
            }
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(.blue)
        }
        .padding(.top, 10)
        .padding(.bottom, 20)
    }
    
    // MARK: - Progress View
    private var progressView: some View {
        VStack(spacing: 16) {
            Text("91%")
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            Text(NSLocalizedString("We're setting up\neverything for you", comment: ""))
                .font(.system(size: 24, weight: .semibold))
                .multilineTextAlignment(.center)
                .foregroundColor(.primary)
            
            // Progress bar
            RoundedRectangle(cornerRadius: 8)
                .fill(
                    LinearGradient(
                        colors: [.orange, .pink, .blue],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 8)
                .padding(.horizontal, 40)
            
            Text(NSLocalizedString("Finalizing results...", comment: ""))
                .font(.system(size: 16))
                .foregroundColor(.secondary)
        }
        .padding(.bottom, 40)
    }
    
    // MARK: - Title View
    private var titleView: some View {
        Text(NSLocalizedString("Start your 3-day FREE\ntrial to continue.", comment: ""))
            .font(.system(size: 28, weight: .bold))
            .multilineTextAlignment(.center)
            .foregroundColor(.primary)
            .padding(.bottom, 40)
    }
    
    // MARK: - Timeline View
    private var timelineView: some View {
        VStack(spacing: 20) {
            timelineItem(
                icon: "lock.open.fill",
                iconColor: .orange,
                title: NSLocalizedString("Today", comment: ""),
                subtitle: NSLocalizedString("Unlock all the app's features like AI\ncalorie scanning and more.", comment: ""),
                isActive: true
            )
            
            timelineItem(
                icon: "bell.fill",
                iconColor: .orange,
                title: NSLocalizedString("In 2 Days - Reminder", comment: ""),
                subtitle: NSLocalizedString("We'll send you a reminder that your\ntrial is ending soon.", comment: ""),
                isActive: false
            )
            
            timelineItem(
                icon: "crown.fill",
                iconColor: .black,
                title: NSLocalizedString("In 3 Days - Billing Starts", comment: ""),
                subtitle: String(format: NSLocalizedString("You'll be charged on %@ unless you cancel anytime before.", comment: ""), getFormattedBillingDate()),
                isActive: false
            )
        }
        .padding(.bottom, 40)
    }
    
    private func timelineItem(icon: String, iconColor: Color, title: String, subtitle: String, isActive: Bool) -> some View {
        HStack(alignment: .top, spacing: 16) {
            VStack {
                ZStack {
                    Circle()
                        .fill(iconColor)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: icon)
                        .foregroundColor(.white)
                        .font(.system(size: 16, weight: .semibold))
                }
                
                if !isActive {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 2, height: 30)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text(subtitle)
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            Spacer()
        }
    }
    
    // MARK: - Pricing Cards View
    private var pricingCardsView: some View {
        HStack(spacing: 12) {
            ForEach(storeManager.products, id: \.id) { product in
                PricingCard(
                    product: product,
                    isSelected: selectedProduct?.id == product.id,
                    storeManager: storeManager
                ) {
                    selectedProduct = product
                }
            }
        }
        .padding(.bottom, 20)
    }
    
    // MARK: - No Payment View
    private var noPaymentView: some View {
        HStack {
            Image(systemName: "checkmark")
                .foregroundColor(.green)
                .font(.system(size: 16, weight: .semibold))
            
            Text(NSLocalizedString("No Payment Due Now", comment: ""))
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.primary)
        }
        .padding(.bottom, 30)
    }
    
    // MARK: - CTA Button View
    private var ctaButtonView: some View {
        Button(action: {
            guard let product = selectedProduct else { return }
            Task {
                let success = await storeManager.purchase(product)
                if success {
                    presentationMode.wrappedValue.dismiss()
                }
            }
        }) {
            HStack {
                if storeManager.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Text(NSLocalizedString("Start My 3-Day Free Trial", comment: ""))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Color.black)
            .cornerRadius(28)
        }
        .disabled(storeManager.isLoading || selectedProduct == nil)
        .padding(.bottom, 20)
    }
    
    // MARK: - Footer Links View
    private var footerLinksView: some View {
        VStack(spacing: 8) {
            if let product = selectedProduct {
                Text(String(format: NSLocalizedString("3 days free, then %@ per %@", comment: ""),
                           storeManager.getProductPrice(product),
                           product.id.contains("yearly") ? NSLocalizedString("year", comment: "") : NSLocalizedString("month", comment: "")))
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
            
            HStack(spacing: 20) {
                Link(NSLocalizedString("Terms of Service", comment: ""), destination: URL(string: "https://strideseeker.com/terms")!)
                    .font(.system(size: 14))
                    .foregroundColor(.blue)
                
                Link(NSLocalizedString("Privacy Policy", comment: ""), destination: URL(string: "https://strideseeker.com/privacy")!)
                    .font(.system(size: 14))
                    .foregroundColor(.blue)
            }
        }
    }
    
    // MARK: - Helper Methods
    private func getFormattedBillingDate() -> String {
        let billingDate = Calendar.current.date(byAdding: .day, value: 3, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.locale = Locale.current
        return formatter.string(from: billingDate)
    }
}

// MARK: - Pricing Card
struct PricingCard: View {
    let product: Product
    let isSelected: Bool
    let storeManager: StoreManager
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 12) {
                if product.id == StoreManager.yearlyProductID {
                    // Free trial badge
                    HStack {
                        Spacer()
                        Text("3 DAYS FREE")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 4)
                            .background(Color.black)
                            .cornerRadius(12)
                        Spacer()
                    }
                    .padding(.top, -8)
                }
                
                VStack(spacing: 4) {
                    Text(product.id.contains("yearly") ? NSLocalizedString("Yearly", comment: "") : NSLocalizedString("Monthly", comment: ""))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text(storeManager.getProductPrice(product))
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.primary)
                    
                    if product.id == StoreManager.yearlyProductID {
                        Text(storeManager.getMonthlyEquivalentPrice(product) + NSLocalizedString("/mo", comment: ""))
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                    } else {
                        Text(NSLocalizedString("/mo", comment: ""))
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Selection indicator
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                        .frame(width: 24, height: 24)
                    
                    if isSelected {
                        Circle()
                            .fill(Color.black)
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: "checkmark")
                            .foregroundColor(.white)
                            .font(.system(size: 12, weight: .bold))
                    }
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .frame(height: 160)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(isSelected ? Color.black : Color.gray.opacity(0.2), lineWidth: isSelected ? 2 : 1)
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#if DEBUG
struct PaywallView_Previews: PreviewProvider {
    static var previews: some View {
        PaywallView()
    }
}
#endif
