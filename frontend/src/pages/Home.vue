<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Manage Household Chores with
              <span class="text-primary">ChoreSprint</span>
            </h1>
            <p class="hero-subtitle">
              Split chores. Earn points. Keep your house happy.
            </p>

            <div v-if="userStore.loading" class="loader"></div>

            <div v-else-if="userStore.user" class="welcome-back">
              <p class="welcome-message">
                Welcome back, {{ userStore.user.name }}!
              </p>
              <router-link to="/dashboard" class="btn btn-primary">
                Go to Dashboard
              </router-link>
            </div>

            <div v-else class="cta-buttons">
              <a :href="getGoogleAuthUrl()" class="btn btn-primary">
                <span class="btn-icon">
                  <!-- Google Icon SVG -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    ></path>
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    ></path>
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                  </svg>
                </span>
                Sign in with Google
              </a>
            </div>
          </div>

          <div class="hero-image">
            <img
              src="../assets/home-hero.svg"
              alt="ChoreSprint Hero"
              class="hero-img"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Why Choose ChoreSprint?</h2>

        <div class="features-grid">
          <div
            v-for="(feature, index) in sections.features"
            :key="index"
            class="feature-card"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">How It Works</h2>

        <div class="steps">
          <div
            v-for="(step, index) in sections.steps"
            :key="index"
            class="step"
          >
            <div class="step-number">{{ step.number }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Coming Soon Section -->
    <section class="coming-soon-section">
      <div class="container">
        <h2 class="section-title">Coming Soon</h2>
        <p class="section-subtitle">
          We're working on exciting new features for future releases
        </p>

        <div class="coming-soon-grid">
          <div
            v-for="(feature, index) in sections.comingSoonFeatures"
            :key="index"
            class="coming-soon-card"
          >
            <div class="coming-soon-icon">{{ feature.icon }}</div>
            <h3 class="coming-soon-title">{{ feature.title }}</h3>
            <p class="coming-soon-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">
            Ready to make household chores fair and fun?
          </h2>
          <p class="cta-subtitle">
            Join ChoreSprint today and transform how your household manages
            chores.
          </p>

          <div v-if="!userStore.user" class="cta-button">
            <a :href="getGoogleAuthUrl()" class="btn btn-lg btn-primary"
              >Get Started for Free</a
            >
          </div>
          <div v-else class="cta-button">
            <router-link to="/dashboard" class="btn btn-lg btn-primary"
              >Go to Dashboard</router-link
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "../stores/user";
import { useHomePageSections } from "../composables/useHomePageSections";
import { getGoogleAuthUrl } from "../utils/config";

// Initialize store
const userStore = useUserStore();
const sections = useHomePageSections();

// Check authentication status when component mounts
onMounted(async () => {
  try {
    // Directly use the store's method to fetch the user
    await userStore.fetchCurrentUser();
  } catch (error) {
    // Silently handle the error - user is not authenticated
    console.log("User not authenticated");
  }
});
</script>

<style scoped>
/* Generated by GitHub Copilot */
/* Hero Section */
.hero-section {
  padding: var(--spacing-2xl) 0;
  background: linear-gradient(to right, #f5f7ff, #ffffff);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: center;
}

.hero-title {
  font-size: var(--font-size-4xl);
  color: var(--dark);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.text-primary {
  color: var(--primary);
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--gray);
  margin-bottom: var(--spacing-xl);
}

.welcome-message {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
  color: var(--gray-dark);
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-img {
  max-width: 100%;
  height: auto;
}

.btn-icon {
  display: inline-flex;
  margin-right: var(--spacing-sm);
}

/* Features Section */
.features-section {
  padding: var(--spacing-2xl) 0;
  background-color: var(--white);
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-3xl);
  color: var(--dark);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.feature-card {
  padding: var(--spacing-lg);
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: transform var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-md);
}

.feature-title {
  font-size: var(--font-size-xl);
  color: var(--primary-dark);
  margin-bottom: var(--spacing-md);
}

.feature-description {
  color: var(--gray);
}

/* How It Works Section */
.how-it-works-section {
  padding: var(--spacing-2xl) 0;
  background-color: var(--light);
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.step {
  text-align: center;
  padding: var(--spacing-lg);
  position: relative;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin: 0 auto var(--spacing-md);
}

.step-title {
  font-size: var(--font-size-xl);
  color: var(--dark);
  margin-bottom: var(--spacing-md);
}

.step-description {
  color: var(--gray);
}

/* Coming Soon Section */
.coming-soon-section {
  padding: var(--spacing-2xl) 0;
  background: linear-gradient(to bottom, var(--white), var(--light));
}

.section-subtitle {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--spacing-xl);
  color: var(--gray);
  font-size: var(--font-size-lg);
}

.coming-soon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.coming-soon-card {
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  text-align: center;
  border-top: 4px solid var(--primary);
  transition: transform var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.coming-soon-card::before {
  content: "Soon";
  position: absolute;
  top: 10px;
  right: -15px;
  background-color: var(--secondary);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: bold;
  padding: 2px 20px;
  transform: rotate(45deg);
}

.coming-soon-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.coming-soon-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.coming-soon-title {
  font-size: var(--font-size-xl);
  color: var(--primary-dark);
  margin-bottom: var(--spacing-md);
}

.coming-soon-description {
  color: var(--gray);
}

/* CTA Section */
.cta-section {
  padding: var(--spacing-2xl) 0;
  background: linear-gradient(45deg, var(--primary-dark), var(--primary));
  color: var(--white);
  text-align: center;
}

.cta-title {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-md);
}

.cta-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  margin-top: var(--spacing-lg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
  }

  .hero-image {
    order: -1;
    margin-bottom: var(--spacing-xl);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
  }

  .cta-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
