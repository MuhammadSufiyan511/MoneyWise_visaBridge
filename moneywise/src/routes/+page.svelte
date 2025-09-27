<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MoneyWise - Smart Expense Tracking</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .card-shadow {
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        .feature-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .hero-illustration {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
        }
    </style>
</head>
<body class="gradient-bg">
    

    <!-- Hero Section -->
    <section class="py-14 md:py-24 px-6">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h1 class="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">Take Control of Your Finances with <span class="text-blue-600">MoneyWise</span></h1>
                <p class="mt-6 text-lg text-gray-600">Track income, expenses and budgets with ease. Our intuitive platform helps you make smarter financial decisions and achieve your money goals.</p>
                <div class="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <a href="/signup" class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-center">Get Started Free</a>
                    <a href="#" class="inline-block px-8 py-3 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition text-center border border-gray-200">
                        <i class="fas fa-play-circle mr-2"></i> Watch Demo
                    </a>
                </div>
                <div class="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                    <div class="flex items-center">
                        <i class="fas fa-check text-green-500 mr-2"></i> No credit card required
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-check text-green-500 mr-2"></i> 14-day free trial
                    </div>
                </div>
            </div>
            <div class="relative">
                <div class="hero-illustration w-full h-80 md:h-96 flex items-center justify-center">
                    <div class="text-white text-center p-6">
                        <i class="fas fa-chart-pie text-6xl mb-4 opacity-80"></i>
                        <h3 class="text-xl font-semibold">Visual Financial Insights</h3>
                    </div>
                </div>
                <!-- Floating elements -->
                <div class="absolute -top-4 -left-4 w-24 h-24 bg-white rounded-xl card-shadow flex flex-col items-center justify-center p-4">
                    <i class="fas fa-wallet text-blue-500 text-2xl mb-2"></i>
                    <span class="text-xs font-medium">Expenses</span>
                </div>
                <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white rounded-xl card-shadow flex flex-col items-center justify-center p-4">
                    <i class="fas fa-chart-bar text-green-500 text-2xl mb-2"></i>
                    <span class="text-xs font-medium">Reports</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white px-6">
        <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800">Powerful Features for Your Financial Success</h2>
                <p class="mt-4 text-gray-600">MoneyWise provides all the tools you need to manage your money effectively.</p>
            </div>
            <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-gray-50 p-8 rounded-xl card-shadow">
                    <div class="feature-icon w-14 h-14 rounded-xl flex items-center justify-center text-white mb-6">
                        <i class="fas fa-chart-pie text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800">Expense Tracking</h3>
                    <p class="mt-4 text-gray-600">Easily categorize and track your spending patterns to identify where your money goes.</p>
                </div>
                <div class="bg-gray-50 p-8 rounded-xl card-shadow">
                    <div class="feature-icon w-14 h-14 rounded-xl flex items-center justify-center text-white mb-6">
                        <i class="fas fa-bullseye text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800">Budget Planning</h3>
                    <p class="mt-4 text-gray-600">Set realistic budgets and get alerts when you're approaching your limits.</p>
                </div>
                <div class="bg-gray-50 p-8 rounded-xl card-shadow">
                    <div class="feature-icon w-14 h-14 rounded-xl flex items-center justify-center text-white mb-6">
                        <i class="fas fa-file-invoice-dollar text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800">Bill Reminders</h3>
                    <p class="mt-4 text-gray-600">Never miss a payment with automated reminders for your upcoming bills.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800">Simple Setup, Powerful Results</h2>
                <p class="mt-4 text-gray-600">Get started in minutes and see the benefits immediately.</p>
            </div>
            <div class="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
                    <h3 class="mt-4 font-semibold text-gray-800">Sign Up</h3>
                    <p class="mt-2 text-gray-600">Create your free account in less than a minute.</p>
                </div>
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">2</div>
                    <h3 class="mt-4 font-semibold text-gray-800">Connect Accounts</h3>
                    <p class="mt-2 text-gray-600">Securely link your bank accounts and credit cards.</p>
                </div>
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">3</div>
                    <h3 class="mt-4 font-semibold text-gray-800">Set Budgets</h3>
                    <p class="mt-2 text-gray-600">Create personalized budgets for different categories.</p>
                </div>
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">4</div>
                    <h3 class="mt-4 font-semibold text-gray-800">Track Progress</h3>
                    <p class="mt-2 text-gray-600">Monitor your financial health with insightful reports.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="py-16 bg-white px-6">
        <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800">Trusted by Thousands</h2>
                <p class="mt-4 text-gray-600">See what our users are saying about MoneyWise.</p>
            </div>
            <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-gray-50 p-6 rounded-xl">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">JS</div>
                        <div class="ml-4">
                            <h4 class="font-semibold">John Smith</h4>
                            <div class="flex text-yellow-400">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600">"MoneyWise helped me save over $3,000 in just six months. The budgeting features are incredibly intuitive."</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-xl">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">MJ</div>
                        <div class="ml-4">
                            <h4 class="font-semibold">Maria Johnson</h4>
                            <div class="flex text-yellow-400">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600">"As a freelancer, tracking my irregular income was challenging. MoneyWise made it simple and stress-free."</p>
                </div>
                <div class="bg-gray-50 p-6 rounded-xl">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">DR</div>
                        <div class="ml-4">
                            <h4 class="font-semibold">David Rodriguez</h4>
                            <div class="flex text-yellow-400">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600">"The bill reminder feature alone is worth the subscription. I haven't missed a payment since I started using MoneyWise."</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-6">
        <div class="max-w-4xl mx-auto bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 class="text-3xl font-bold">Ready to Transform Your Financial Future?</h2>
            <p class="mt-4 text-blue-100">Join thousands of users who have taken control of their finances with MoneyWise.</p>
            <div class="mt-8">
                <a href="/signup" class="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition">Start Your Free Trial</a>
            </div>
            <p class="mt-4 text-sm text-blue-200">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
    </section>

   
</body>
</html>