<script>
  import { signUp } from '../../lib/services/authServices';
  import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
  import { auth } from '../../lib/firebase'; // Adjust path as needed
  import { goto } from '$app/navigation';
  
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let isLoading = false;
  let showPassword = false;
  let showConfirmPassword = false;

  // Password strength validation
  $: passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  $: passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  $: isFormValid = name && email && password && confirmPassword && passwordsMatch && password.length >= 6;

  async function submit() {
    error = '';
    isLoading = true;

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      isLoading = false;
      return;
    }

    try {
      await signUp(email, password, name);
      goto('/dashboard');
    } catch (e) {
      error = e.message || 'Signup failed';
    }
    
    isLoading = false;
  }

  async function signUpWithGoogle() {
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
      error = e.message || 'Google signup failed';
    }
    
    isLoading = false;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-800">Create Account</h1>
      <p class="text-slate-600 mt-2">Join us to start tracking your expenses</p>
    </div>

    <!-- Form Container -->
    <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <!-- Google Signup Button -->
      <button
        on:click={signUpWithGoogle}
        disabled={isLoading}
        class="w-full flex items-center justify-center px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {isLoading ? 'Creating Account...' : 'Continue with Google'}
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
        <!-- Name Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
          <input 
            bind:value={name}
            type="text"
            placeholder="Enter your full name"
            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required 
          />
        </div>

        <!-- Email Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <input 
            bind:value={email}
            type="email"
            placeholder="Enter your email"
            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required 
          />
        </div>

        <!-- Password Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <div class="relative">
            <input 
              bind:value={password}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              class="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              minlength="6"
              required 
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
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
          
          <!-- Password Strength Indicator -->
          {#if password.length > 0}
            <div class="mt-2 space-y-1">
              <div class="flex space-x-1">
                <div class="h-1 w-1/4 rounded-full {passwordStrength.length ? 'bg-green-500' : 'bg-slate-300'}"></div>
                <div class="h-1 w-1/4 rounded-full {passwordStrength.uppercase ? 'bg-green-500' : 'bg-slate-300'}"></div>
                <div class="h-1 w-1/4 rounded-full {passwordStrength.number ? 'bg-green-500' : 'bg-slate-300'}"></div>
                <div class="h-1 w-1/4 rounded-full {passwordStrength.special ? 'bg-green-500' : 'bg-slate-300'}"></div>
              </div>
              <p class="text-xs text-slate-500">
                Password should have 8+ characters, uppercase, lowercase, number, and special character
              </p>
            </div>
          {/if}
        </div>

        <!-- Confirm Password Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
          <div class="relative">
            <input 
              bind:value={confirmPassword}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              class="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required 
            />
            <button
              type="button"
              on:click={() => showConfirmPassword = !showConfirmPassword}
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {#if showConfirmPassword}
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
          {#if confirmPassword && !passwordsMatch}
            <p class="text-red-500 text-xs mt-1">Passwords do not match</p>
          {:else if confirmPassword && passwordsMatch}
            <p class="text-green-500 text-xs mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Passwords match
            </p>
          {/if}
        </div>

        <!-- Terms Checkbox -->
        <div class="flex items-start">
          <input type="checkbox" id="terms" required class="mt-1 mr-3">
          <label for="terms" class="text-sm text-slate-600">
            I agree to the <a href="/terms" class="text-blue-600 hover:underline">Terms of Service</a> 
            and <a href="/privacy" class="text-blue-600 hover:underline">Privacy Policy</a>
          </label>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          disabled={!isFormValid || isLoading}
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium
                 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105"
        >
          {#if isLoading}
            <svg class="animate-spin w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {:else}
            Create Account
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

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <p class="text-slate-600">
          Already have an account? 
          <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  </div>
</div>