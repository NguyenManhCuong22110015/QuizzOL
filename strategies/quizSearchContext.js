export  class QuizSearchContext {
    constructor(strategy) {
      this.strategy = strategy;
    }
  
    async search(term) {
      return this.strategy.search(term);
    }
  };
  