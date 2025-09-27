<script>
  import { signIn } from '../../lib/services/authServices';
  import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
  import { auth } from '../../lib/firebase'; // Adjust path as needed
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;
  let showPassword = false;
  let rememberMe = false;

  async function submit() {
    error = '';
    isLoading = true;
    
    try {
      await signIn(email, password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }
      
      goto('/dashboard');
    } catch (e) {
      error = e.message || 'Login failed';
    }
    
    isLoading = false;
  }

  async function signInWithGoogle() {
    error = '';
    isLoading = true;
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      // User is now signed in, redirect to dashboard
      goto('/dashboard');
    } catch (e) {
      error = e.message || 'Google login failed';
    }
    
    isLoading = false;
  }

  // Load saved email if remember me was checked
  import { onMount } from 'svelte';
  onMount(() => {
    if (localStorage.getItem('rememberMe') === 'true') {
      email = localStorage.getItem('savedEmail') || '';
      rememberMe = true;
    }
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-800">Welcome Back</h1>
      <p class="text-slate-600 mt-2">Sign in to your expense tracker account</p>
    </div>

    <!-- Form Container -->
    <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <!-- Google Login Button -->
      <button
        on:click={signInWithGoogle}
        disabled={isLoading}
        class="w-full flex items-center justify-center px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      <!-- Divider -->
      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-slate-500">Or continue with email</span>
        </div>
      </div>

      <!-- Form -->
      <form on:submit|preventDefault={submit} class="space-y-5">
        <!-- Email Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <div class="relative">
            <input 
              bind:value={email}
              type="email"
              placeholder="Enter your email"
              class="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required 
            />
            <svg class="absolute left-4 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
            </svg>
          </div>
        </div>

        <!-- Password Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <div class="relative">
            <input 
              bind:value={password}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              class="w-full px-4 py-3 pl-12 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required 
            />
            <svg class="absolute left-4 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
            >
              {#if showPassword}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input 
              bind:checked={rememberMe}
              type="checkbox" 
              class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <span class="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          <a href="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700 hover:underline">
            Forgot password?
          </a>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          disabled={isLoading || !email || !password}
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium
                 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
        >
          {#if isLoading}
            <div class="flex items-center justify-center">
              <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          {:else}
            Sign In
          {/if}
        </button>

        <!-- Error Message -->
        {#if error}
          <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
            <svg class="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-red-700 font-medium">{error}</p>
          </div>
        {/if}
      </form>
    </div>
    <div class="text-center mt-6">
      <p class="text-sm text-slate-600">
        Don't have an account? 
        <a href="/signup" class="text-blue-600 hover:text-blue-700 hover:underline">Sign Up</a>
      </p>
    </div>
    </div>
    <!-- Sign Up Link -->
</div>