function logActivity(func) {
    return function (req, res, next) {
        const currentTime = new Date().toISOString();  // Lấy thời gian hiện tại
        console.log(`[${currentTime}] Received ${req.method} request for ${req.originalUrl}`);  // Ghi log khi bắt đầu

        res.on('finish', () => {
            console.log(`[${currentTime}] Response sent for ${req.method} request to ${req.originalUrl}`);  // Ghi log khi hoàn thành
        });

        func(req, res, next);
    };
}
export default logActivity;