<script>
  import { user } from '$lib/stores/user';
  import { transactions, startTransactions, stopTransactions } from '$lib/stores/transactions';
  import { budgets, startBudgets, stopBudgets } from '$lib/stores/budget';
   import BudgetForm from '../budgets/BudgetForm.svelte';
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { get } from 'svelte/store';
  
  let ApexCharts;
  let budgetModalOpen = false;
  let monthlyChart, weeklyChart, categoryChart, comparisonChart;
  let chartsInitialized = false;
  let lastUpdateTime = new Date();
  
  // Add reactive declarations to force updates
  let currentTransactions = [];
  
  onMount(async () => {
    console.log('Dashboard mounted, starting data fetch...');
    
    // Dynamically import ApexCharts
    const module = await import('apexcharts');
    ApexCharts = module.default;
    
    const currentUser = get(user);
    if (currentUser) {
      console.log('User found, starting transactions:', currentUser.uid);
      startTransactions(currentUser.uid);
       startBudgets(currentUser.uid);
    } else {
      console.log('No user found');
    }
  });

  // Watch for user changes and restart transactions
  $: if ($user && !chartsInitialized) {
    console.log('User changed, restarting transactions:', $user.uid);
    startTransactions($user.uid);
  }

  // Watch for transaction changes and update everything
  $: if ($transactions && $transactions !== currentTransactions) {
    console.log('Transactions updated:', $transactions.length);
    currentTransactions = $transactions;
    lastUpdateTime = new Date();
    
    if (ApexCharts && !chartsInitialized) {
      setTimeout(initializeCharts, 100);
    } else if (ApexCharts && chartsInitialized) {
      updateCharts();
    }
  }

  onDestroy(() => {
    console.log('Dashboard destroyed, cleaning up...');
    stopTransactions();
    // Clean up charts
    stopBudgets();
    if (monthlyChart) monthlyChart.destroy();
    if (weeklyChart) weeklyChart.destroy();
    if (categoryChart) categoryChart.destroy();
    if (comparisonChart) comparisonChart.destroy();
  });

  // Reactive calculations that update when transactions change
  $: total = $transactions.reduce(
    (s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 
    0
  );

  $: income = $transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  $: expenses = $transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  $: recentTransactions = $transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  // Debug reactive statements
  $: console.log('Reactive update - Total:', total, 'Income:', income, 'Expenses:', expenses, 'Transactions count:', $transactions.length);


 // ---------- BUDGET HELPERS & REACTIVES ----------
  // spentFor(budget): returns amount spent for the budget's category within its period
  function spentFor(budget) {
    if (!budget) return 0;
    const start = new Date(budget.periodStart).getTime();
    const end = new Date(budget.periodEnd).getTime();
    return $transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const tTime = new Date(t.date).getTime();
        const sameCategory = (budget.category || 'Uncategorized') === (t.category || 'Uncategorized');
        return sameCategory && tTime >= start && tTime <= end;
      })
      .reduce((s, t) => s + Number(t.amount || 0), 0);
  }

  // Total amount allocated across all budgets
  $: totalBudgetAmount = $budgets ? $budgets.reduce((s, b) => s + Number(b.amount || 0), 0) : 0;
  // Total spent across all budgets (computed by summing spentFor for each budget)
  $: totalBudgetSpent = $budgets ? $budgets.reduce((s, b) => s + spentFor(b), 0) : 0;
  $: budgetsCount = $budgets ? $budgets.length : 0;
  // ------------------------------------------------







  function generateMonthlyData(transactions) {
    const monthlyStats = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyStats[monthKey] = { month: monthName, income: 0, expenses: 0 };
    }

    transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7);
      if (monthlyStats[monthKey]) {
        if (t.type === 'income') {
          monthlyStats[monthKey].income += Number(t.amount);
        } else {
          monthlyStats[monthKey].expenses += Number(t.amount);
        }
      }
    });

    return Object.values(monthlyStats);
  }

  function generateWeeklyData(transactions) {
    const weeklyStats = {};
    const currentDate = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().slice(0, 10);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyStats[dayKey] = { day: dayName, balance: 0 };
    }

    transactions.forEach(t => {
      if (weeklyStats[t.date]) {
        weeklyStats[t.date].balance += t.type === 'income' ? Number(t.amount) : -Number(t.amount);
      }
    });

    return Object.values(weeklyStats);
  }

  function generateCategoryData(transactions) {
    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const category = t.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + Number(t.amount);
    });

    return {
      categories: Object.keys(categories),
      amounts: Object.values(categories)
    };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function initializeCharts() {
    if (!ApexCharts || chartsInitialized) return;
    
    console.log('Initializing charts with', $transactions.length, 'transactions');

    const monthlyData = generateMonthlyData($transactions);
    const weeklyData = generateWeeklyData($transactions);
    const categoryData = generateCategoryData($transactions);

    // Monthly Trend Chart
    const monthlyOptions = {
      series: [
        {
          name: 'Income',
          data: monthlyData.map(d => d.income),
          color: '#10b981'
        },
        {
          name: 'Expenses', 
          data: monthlyData.map(d => d.expenses),
          color: '#ef4444'
        }
      ],
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      stroke: {
        width: 4,
        curve: 'smooth'
      },
      xaxis: {
        categories: monthlyData.map(d => d.month),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          },
          formatter: (value) => formatCurrency(value)
        }
      },
      grid: {
        strokeDashArray: 3,
        borderColor: '#f0f0f0'
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: (value) => formatCurrency(value)
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      }
    };

    // Weekly Balance Trend
    const weeklyOptions = {
      series: [{
        name: 'Daily Balance',
        data: weeklyData.map(d => d.balance),
        color: '#3b82f6'
      }],
      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 100]
        }
      },
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      xaxis: {
        categories: weeklyData.map(d => d.day),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          },
          formatter: (value) => formatCurrency(value)
        }
      },
      grid: {
        strokeDashArray: 3,
        borderColor: '#f0f0f0'
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: (value) => formatCurrency(value)
        }
      }
    };

    // Category Pie Chart
    const categoryOptions = {
      series: categoryData.amounts,
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      labels: categoryData.categories,
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'],
      plotOptions: {
        pie: {
          donut: {
            size: '60%'
          }
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: (value) => formatCurrency(value)
        }
      },
      legend: {
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    // Income vs Expenses Comparison
    const comparisonOptions = {
      series: [{
        data: [
          {x: 'Income', y: income, fillColor: '#10b981'},
          {x: 'Expenses', y: expenses, fillColor: '#ef4444'}
        ]
      }],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '50%',
          distributed: true
        }
      },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#6b7280',
            fontSize: '12px'
          },
          formatter: (value) => formatCurrency(value)
        }
      },
      grid: {
        strokeDashArray: 3,
        borderColor: '#f0f0f0'
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: (value) => formatCurrency(value)
        }
      },
      legend: { show: false }
    };

    // Initialize charts with error handling
    try {
      if (document.getElementById('monthly-chart')) {
        monthlyChart = new ApexCharts(document.getElementById('monthly-chart'), monthlyOptions);
        monthlyChart.render();
        console.log('Monthly chart initialized');
      }

      if (document.getElementById('weekly-chart')) {
        weeklyChart = new ApexCharts(document.getElementById('weekly-chart'), weeklyOptions);
        weeklyChart.render();
        console.log('Weekly chart initialized');
      }

      if (document.getElementById('category-chart') && categoryData.amounts.length > 0) {
        categoryChart = new ApexCharts(document.getElementById('category-chart'), categoryOptions);
        categoryChart.render();
        console.log('Category chart initialized');
      }

      if (document.getElementById('comparison-chart')) {
        comparisonChart = new ApexCharts(document.getElementById('comparison-chart'), comparisonOptions);
        comparisonChart.render();
        console.log('Comparison chart initialized');
      }

      chartsInitialized = true;
      console.log('All charts initialized successfully');
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  }

  function updateCharts() {
    if (!ApexCharts || !chartsInitialized) return;
    
    console.log('Updating charts with new data...');

    const monthlyData = generateMonthlyData($transactions);
    const weeklyData = generateWeeklyData($transactions);
    const categoryData = generateCategoryData($transactions);

    try {
      // Update monthly chart
      if (monthlyChart) {
        monthlyChart.updateSeries([
          {
            name: 'Income',
            data: monthlyData.map(d => d.income)
          },
          {
            name: 'Expenses', 
            data: monthlyData.map(d => d.expenses)
          }
        ]);
        console.log('Monthly chart updated');
      }

      // Update weekly chart
      if (weeklyChart) {
        weeklyChart.updateSeries([{
          name: 'Daily Balance',
          data: weeklyData.map(d => d.balance)
        }]);
        console.log('Weekly chart updated');
      }

      // Update category chart
      if (categoryChart && categoryData.amounts.length > 0) {
        categoryChart.updateOptions({
          series: categoryData.amounts,
          labels: categoryData.categories
        });
        console.log('Category chart updated');
      }

      // Update comparison chart
      if (comparisonChart) {
        comparisonChart.updateSeries([{
          data: [
            {x: 'Income', y: income, fillColor: '#10b981'},
            {x: 'Expenses', y: expenses, fillColor: '#ef4444'}
          ]
        }]);
        console.log('Comparison chart updated');
      }

      lastUpdateTime = new Date();
      console.log('All charts updated at:', lastUpdateTime);
    } catch (error) {
      console.error('Error updating charts:', error);
    }
  }




  
</script>

<svelte:head>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p class="text-gray-600 text-lg">Welcome back! Here's your financial overview.</p>
      </div>
      <div class="mt-4 md:mt-0 flex items-center space-x-3">
        <div class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <i class="fas fa-circle text-green-500 mr-2 animate-pulse"></i>
          Live Data
        </div>
        <div class="text-sm text-gray-500">
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  </div>


  <!-- Enhanced Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <!-- Balance Card -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium opacity-90">Total Balance</h3>
          <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <i class="fas fa-wallet text-lg"></i>
          </div>
        </div>
        <div class="text-4xl font-bold mb-2">
          {formatCurrency(total)}
        </div>
        <div class="flex items-center text-sm opacity-80">
          <i class="fas fa-arrow-{total >= 0 ? 'up' : 'down'} mr-2"></i>
          <span>{total >= 0 ? 'Positive' : 'Negative'} balance</span>
        </div>
      </div>
    </div>

    <!-- Income Card -->
    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-green-200 group">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">Total Income</h3>
        <div class="p-3 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors">
          <i class="fas fa-arrow-trend-up text-green-600 text-lg"></i>
        </div>
      </div>
      <div class="text-3xl font-bold text-gray-800 mb-2">
        {formatCurrency(income)}
      </div>
      <div class="flex items-center text-sm text-green-600 font-medium">
        <i class="fas fa-plus-circle mr-2"></i>
        <span>{$transactions.filter(t => t.type === 'income').length} transactions</span>
      </div>
    </div>

    <!-- Expenses Card -->
    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-red-200 group">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors">Total Expenses</h3>
        <div class="p-3 bg-red-100 group-hover:bg-red-200 rounded-xl transition-colors">
          <i class="fas fa-arrow-trend-down text-red-600 text-lg"></i>
        </div>
      </div>
      <div class="text-3xl font-bold text-gray-800 mb-2">
        {formatCurrency(expenses)}
      </div>
      <div class="flex items-center text-sm text-red-600 font-medium">
        <i class="fas fa-minus-circle mr-2"></i>
        <span>{$transactions.filter(t => t.type === 'expense').length} transactions</span>
      </div>
    </div>

     <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-medium text-gray-600 group-hover:text-indigo-700 transition-colors">Budgets</h3>
        <div class="p-3 bg-indigo-50 rounded-xl">
          <i class="fas fa-wallet text-indigo-600 text-lg"></i>
        </div>
      </div>

      <div class="text-2xl font-bold text-gray-800 mb-2">
        {formatCurrency(totalBudgetAmount)}
      </div>

      <div class="text-sm text-gray-600 mb-2">
        {budgetsCount} {budgetsCount === 1 ? 'budget' : 'budgets'}
      </div>

      <div class="text-sm text-indigo-600 font-medium mb-2">
        {formatCurrency(totalBudgetSpent)} spent
      </div>

      <div class="w-full bg-indigo-100 rounded-full h-2">
        <div
          class="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
          style="width: { totalBudgetAmount > 0 ? Math.min(100, (totalBudgetSpent / totalBudgetAmount) * 100) : 0 }%"
        ></div>
      </div>

      <div class="mt-3 text-xs text-gray-500">
        {totalBudgetAmount > 0
          ? Math.round(totalBudgetAmount > 0 ? Math.min(100, (totalBudgetSpent / totalBudgetAmount) * 100) : 0) + '% used'
          : 'No budget allocation'}
      </div>
    </div>
    <!-- --------------------------------------- -->
  </div>


  <!-- Charts Section -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Monthly Trend Chart -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">Monthly Trends</h3>
        <div class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <i class="fas fa-chart-line mr-1"></i>
          6 Months
        </div>
      </div>
      <div id="monthly-chart"></div>
    </div>

    <!-- Weekly Balance Trend -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">7-Day Balance Trend</h3>
        <div class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          <i class="fas fa-calendar-week mr-1"></i>
          This Week
        </div>
      </div>
      <div id="weekly-chart"></div>
    </div>
  </div>

  <!-- Second Row of Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Category Breakdown -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">Expense Categories</h3>
        <div class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
          <i class="fas fa-chart-pie mr-1"></i>
          Breakdown
        </div>
      </div>
      {#if $transactions.filter(t => t.type === 'expense').length > 0}
        <div id="category-chart"></div>
      {:else}
        <div class="h-72 flex items-center justify-center">
          <div class="text-center">
            <i class="fas fa-chart-pie text-gray-400 text-4xl mb-4"></i>
            <h4 class="text-lg font-semibold text-gray-600 mb-2">No Category Data</h4>
            <p class="text-gray-500">Add expense transactions to see breakdown</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Income vs Expenses Comparison -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">Income vs Expenses</h3>
        <div class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <i class="fas fa-balance-scale mr-1"></i>
          Comparison
        </div>
      </div>
      <div id="comparison-chart"></div>
    </div>
  </div>
 <!-- Budgets Section -->
<section class="mt-8">
  <div class="flex justify-between items-center mb-3">
    <h2 class="text-xl font-semibold">Budgets</h2>
    <button 
      class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      on:click={() => budgetModalOpen = true}
    >
      Set Budget
    </button>
  </div>

  {#if $budgets.length === 0}
    <p class="text-gray-500">No budgets set. Click "Set Budget" to create one.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each $budgets as budget}
        <div class="bg-white p-4 rounded shadow">
          <div class="font-semibold">{budget.category}</div>
          <div class="text-sm text-gray-500">
            {new Date(budget.periodStart).toLocaleDateString()} – {new Date(budget.periodEnd).toLocaleDateString()}
          </div>
          <div class="mt-2">
            <progress 
              class="w-full h-3" 
              value={spentFor(budget)} 
              max={budget.amount}></progress>
            <div class="text-sm mt-1">
              {formatCurrency(spentFor(budget))} / {formatCurrency(budget.amount)}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>
  <!-- Action Buttons -->
  <div class="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
    <a 
      href="/transactions" 
      class="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
    >
      <i class="fas fa-list-alt mr-3 text-lg"></i>
      Manage Transactions
    </a>
    
    <button class="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
      <i class="fas fa-plus-circle mr-3 text-lg"></i>
      Add Transaction
    </button>

    <button class="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
      <i class="fas fa-chart-line mr-3 text-lg"></i>
      View Reports
    </button>

    <button class="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:from-orange-700 hover:to-orange-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
      <i class="fas fa-download mr-3 text-lg"></i>
      Export Data
    </button>
  </div>
  <!-- Recent Transactions & Quick Stats -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Recent Transactions -->
    {#if recentTransactions.length > 0}
    <div class="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-800">Recent Transactions</h3>
        <a href="/transactions" class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center group">
          View All
          <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </a>
      </div>
      
      <div class="space-y-4">
        {#each recentTransactions as transaction, index}
          <div class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md" style="animation-delay: {index * 0.1}s">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div class="p-3 rounded-xl {transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                  <i class="fas {transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'} text-lg"></i>
                </div>
                {#if index === 0}
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                {/if}
              </div>
              <div>
                <div class="font-semibold text-gray-800">{transaction.description || 'Transaction'}</div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-500">{transaction.category || 'Uncategorized'}</span>
                  <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span class="text-sm text-gray-500">{transaction.date}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg {transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    {:else}
    <div class="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center justify-center">
      <div class="text-center">
        <i class="fas fa-receipt text-gray-400 text-4xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
        <p class="text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
        <button class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Add Transaction
        </button>
      </div>
    </div>
    {/if}

    <!-- Quick Actions & Insights -->
    <div class="space-y-6">
      <!-- Financial Health Score -->
      <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Financial Health</h3>
          <div class="p-2 bg-indigo-100 rounded-lg">
            <i class="fas fa-heartbeat text-indigo-600"></i>
          </div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-indigo-600 mb-2">
            {Math.round(income > 0 ? Math.min(100, Math.max(0, (total / income) * 100)) : 0)}
          </div>
          <div class="text-sm text-gray-600 mb-3">Health Score</div>
          <div class="w-full bg-indigo-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000" style="width: {Math.max(0, Math.min(100, income > 0 ? (total / income) * 100 : 0))}%"></div>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            Based on income vs balance ratio
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-3">
          <button class="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium flex flex-col items-center space-y-2 group">
            <i class="fas fa-file-export text-lg group-hover:scale-110 transition-transform"></i>
            <span>Export</span>
          </button>
          <button class="p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium flex flex-col items-center space-y-2 group">
            <i class="fas fa-bullseye text-lg group-hover:scale-110 transition-transform"></i>
            <span>Budget</span>
          </button>
          <button class="p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors text-sm font-medium flex flex-col items-center space-y-2 group">
            <i class="fas fa-tags text-lg group-hover:scale-110 transition-transform"></i>
            <span>Categories</span>
          </button>
          <button class="p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors text-sm font-medium flex flex-col items-center space-y-2 group">
            <i class="fas fa-cog text-lg group-hover:scale-110 transition-transform"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>

      <!-- Savings Goal Progress -->
      <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Savings Progress</h3>
          <div class="p-2 bg-emerald-100 rounded-lg">
            <i class="fas fa-piggy-bank text-emerald-600"></i>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Monthly Goal</span>
            <span class="text-sm font-semibold text-emerald-600">{formatCurrency(1000)}</span>
          </div>
          <div class="w-full bg-emerald-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-1000" style="width: {Math.min(100, Math.max(0, (total / 1000) * 100))}%"></div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Current</span>
            <span class="text-sm font-semibold text-gray-800">{formatCurrency(Math.max(0, total))}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<BudgetForm bind:open={budgetModalOpen} on:created={() => {
 
}} />
<style>
  /* Animation for transaction items */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Pulse animation for new transactions */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Custom scrollbar for better UX */
  :global(::-webkit-scrollbar) {
    width: 6px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #f1f5f9;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    border-radius: 3px;
  }

  /* Smooth transitions for all elements */
  :global(*) {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Chart container styling */
  :global(.apexcharts-canvas) {
    font-family: 'Inter', sans-serif !important;
  }

  :global(.apexcharts-tooltip) {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    border-radius: 12px !important;
    border: 1px solid #e5e7eb !important;
  }

  :global(.apexcharts-legend-text) {
    color: #6b7280 !important;
    font-weight: 500 !important;
  }

  /* Loading animation for charts */
  .chart-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #6b7280;
    font-size: 14px;
  }

  /* Responsive grid improvements */
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  /* Enhanced hover effects */
  .group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
  }

  .group:hover .group-hover\:translate-x-1 {
    transform: translateX(0.25rem);
  }

  /* Gradient animation */
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
  }
</style>