import quizService from '../services/quizService.js';
import resultService from '../services/resultService.js';

export default {
  /**
   * Render home page with all required data
   */
  getHomePage: async (req, res) => {
    res.render("index", {
      layout: "main",
      title: "QuizMaster - Learn Through Quizzes",
      pageId: 'home',
      features: [
        {
          icon: "bolt",
          title: "Learn Faster",
          description:
            "Active recall through quizzes helps retain information 2x more effectively than passive reading.",
        },
        {
          icon: "chart-line",
          title: "Track Progress",
          description:
            "Detailed analytics and performance tracking to identify strengths and areas for improvement.",
        },
        {
          icon: "users",
          title: "Social Learning",
          description:
            "Share quizzes, challenge friends, and learn collaboratively with our community features.",
        },
        {
          icon: "infinity",
          title: "Unlimited Quizzes",
          description:
            "Create and take as many quizzes as you want with our flexible platform.",
        },
        {
          icon: "mobile-alt",
          title: "Mobile Friendly",
          description:
            "Learn anytime, anywhere with our responsive design optimized for all devices.",
        },
        {
          icon: "shield-alt",
          title: "Privacy First",
          description:
            "Your data belongs to you. We prioritize your privacy and security.",
        },
      ],
      stats: [
        { value: "5M+", label: "Active Users" },
        { value: "10M+", label: "Quizzes Created" },
        { value: "50+", label: "Subject Categories" },
        { value: "100+", label: "Countries" },
      ],
      categories: [
        { icon: "calculator", title: "Mathematics", count: "1,250+" },
        { icon: "flask", title: "Science", count: "1,870+" },
        { icon: "book", title: "Literature", count: "950+" },
        { icon: "globe-americas", title: "Geography", count: "780+" },
        { icon: "laptop-code", title: "Computer Science", count: "1,150+" },
        { icon: "landmark", title: "History", count: "920+" },
        { icon: "language", title: "Languages", count: "850+" },
        { icon: "palette", title: "Arts", count: "670+" },
      ],
      demoQuestions: [
        {
          question: "Which planet is known as the Red Planet?",
          options: [
            { id: "q1a", value: "Mars", correct: true },
            { id: "q1b", value: "Venus" },
            { id: "q1c", value: "Jupiter" },
            { id: "q1d", value: "Saturn" },
          ],
        },
        {
          question: 'Who wrote "Romeo and Juliet"?',
          options: [
            { id: "q2a", value: "Charles Dickens" },
            { id: "q2b", value: "William Shakespeare", correct: true },
            { id: "q2c", value: "Jane Austen" },
            { id: "q2d", value: "F. Scott Fitzgerald" },
          ],
        },
      ],
      steps: [
        {
          number: 1,
          title: "Create Your Quiz",
          description:
            "Build custom quizzes with various question types, images, and personalized settings.",
        },
        {
          number: 2,
          title: "Share It",
          description:
            "Invite others through a link, embed it on your website, or share with your class.",
        },
        {
          number: 3,
          title: "Learn & Improve",
          description:
            "Track your progress, analyze performance, and focus on areas that need improvement.",
        },
      ],
      testimonials: [
        {
          avatar: "👨🏽‍🏫",
          name: "Michael Rodriguez",
          role: "High School Teacher",
          text: "QuizMaster has revolutionized how I engage my students. The instant feedback and analytics help me focus on areas where my class needs more support.",
        },
        {
          avatar: "👩🏻‍🎓",
          name: "Sarah Johnson",
          role: "College Student",
          text: "I use QuizMaster to prepare for all my exams. Creating my own quizzes helps reinforce what I've learned, and the spaced repetition feature is amazing!",
        },
        {
          avatar: "👨🏿‍💼",
          name: "David Washington",
          role: "Corporate Trainer",
          text: "Our company uses QuizMaster for onboarding and continuous learning. It's easy to use, customizable, and the reporting tools are excellent.",
        },
      ],
    });
  },

  /**
   * Get top players by specified criteria and time period
   */
  getTopPlayersByCriteria: async (req, res) => {
    try {
      const { criteria, time } = req.query;
      
      const topPlayers = await resultService.getTopPlayersByCriteria(criteria, time);
      return res.json(topPlayers);
    } catch (error) {
      console.error("Error fetching top players:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};