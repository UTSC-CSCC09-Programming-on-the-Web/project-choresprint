export function useHomePageSections() {
  // Features section data
  const features = [
    {
      icon: "🏠",
      title: "Create Your House",
      description:
        "Setup your house and invite family members or roommates to join using invitation codes.",
    },
    {
      icon: "✓",
      title: "Assign Chores",
      description:
        "Create and assign chores with descriptions, due dates, and points values.",
    },
    {
      icon: "🤖",
      title: "AI Chore Completion Verification",
      description:
        "Upload photos of completed chores to be automatically verified by our AI system and track everyone's contributions to household maintenance.",
    },
    {
      icon: "📊",
      title: "Earn Points",
      description:
        "Earn points for completing chores and see who contributes the most in your household.",
    },
  ];

  // How it works steps
  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description:
        "Create an account using your Google account for quick and secure access.",
    },
    {
      number: 2,
      title: "Create or Join a House",
      description:
        "Create your own house or join an existing one with an invitation code.",
    },
    {
      number: 3,
      title: "Manage Chores",
      description:
        "Add chores, set deadlines, assign tasks, and track completion.",
    },
  ];

  // Coming soon features
  const comingSoonFeatures = [
    {
      icon: "🎮",
      title: "Chore Draft Lobby",
      description:
        "Join real-time chore draft sessions to fairly distribute tasks among household members.",
    },
    {
      icon: "⚖️",
      title: "Chore Court",
      description:
        "Vote on disputed chores in a democratic process to ensure fairness.",
    },
    {
      icon: "🔔",
      title: "Weekly Digest",
      description:
        "Receive weekly summaries and statistics about your household's chore completion.",
    },
  ];

  return {
    features,
    steps,
    comingSoonFeatures,
  };
}
