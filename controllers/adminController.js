export default {
    // Render admin dashboard
    getDashboard: (req, res) => {
        res.render('layouts/admin', { 
            title: 'Admin Dashboard',
            layout: 'admin'  
        });
    },

    // Render quizzes management page
    getQuizzes: (req, res) => {
        res.render('quizzes', { 
            title: 'Admin Dashboard',
            layout: 'admin',
            activePage: 'quizzes'
        });
    },

    // Render admin settings page
    getSettings: (req, res) => {
        res.render('adminSetting', {
            title: 'Admin Setting',
            layout: 'admin',
            css: 'setting.css',
            activePage: 'setting'
        });
    },

    // Render overview page
    getOverview: (req, res) => {
        res.render('overview', {
            title: 'Admin Overview',
            layout: 'admin',
            activePage: 'overview'
        });
    },

    // Render add question page
    getAddQuestionPage: (req, res) => {
        const quizId = req.params.id;
        res.render('addQuestion', {
            title: 'Thêm câu hỏi',
            layout: 'admin',
            css: 'addquestion',
            quizId
        });
    }
};