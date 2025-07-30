<template>
  <div class="credits-container">
    <h1>Credits & Prompts</h1>
    <p>
      This page is dedicated to the prompts and resources used while building
      ChoreSprint with GitHub Copilot.
    </p>
    <div class="prompts-section">
      <h2>Prompts Used</h2>
      <ul>
        <!-- Add your prompts here -->
        <li>
          "The alpha version of this project focuses on building the core user
          experience and laying down the foundational features of the household
          chore management system. It includes: User authentication using OAuth
          2.0 (e.g., Google) with token-based auth. House management, allowing a
          logged-in user to: Create a new house. Generate an invite code to
          share with others. Join a house via an invite code. Basic dashboard
          that: Displays user status and house membership. Redirects
          unauthenticated users to login. Chore creation form where users can:
          Add chores with a title, description, due date, and reference image.
          Chore assignment and editing restricted to the house creator. Backend
          API endpoints for managing users, houses, chores, and invitations.
          Database integration using PostgreSQL and Prisma ORM. This version
          avoids unnecessary complexity (e.g., no real-time features or AI
          verification yet), and ensures a fully working, testable MVP for team
          collaboration and feedback. I want you to polish the current ui after
          analyzing frontend and backend implementatioin for the alpha version.
          apply best vue practise where necessary. the current ui is very basic.
          current class name don't do anything so there's no styling. add info
          to home page. make the ui overall more visually appealing. make the
          code reusable keeping in mind beta and final versions."
        </li>
        <li>"write me the necessary stores and composables"</li>
        <li>
          "how should i change current pages to use stores and composables?"
        </li>
        <li>"make the verification real time"</li>
        <li>
          "add ui for house owners to enable and disable admin role for other
          house members"
        </li>
        <li>
          "overall, the ui looks good. however, it doesn't look good on mobile
          screens. can you polish the ui to make the mobile experience better?"
        </li>
        <li>"add a page to view chore details for each chore"</li>
        <li>"Please maintain the frontend styling for all stripe features"</li>
        <li>"Refactor my countdown implementation so that it's real-time"</li>
        <li>
          "Im adding weekly digests and I want to have an email to use very
          temporarily to send these weekly digests to users, what can I use
          that's the most cost/time efficient and what can I use to automate
          this?
        </li>
        <li>
          "Make it so that when the user's account is deleted, it automatically
          signs the user out"
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed for static credits page
</script>

<style scoped>
.credits-container {
  max-width: 700px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}
h1 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: var(--primary);
}
h2 {
  font-size: 1.2rem;
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--secondary);
}
.prompts-section ul {
  list-style: disc inside;
  padding-left: var(--spacing-md);
}
.prompts-section li {
  margin-bottom: var(--spacing-sm);
  color: var(--gray-dark);
}
</style>
