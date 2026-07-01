const Favourite = require("../models/Favourite");

//Thêm phim yêu thích
exports.addFavourite = async (req, res) => {
    try {

        const userId = req.user.id;
        const { movieId } = req.body;

        const existed = await Favourite.findOne({
            user: userId,
            movie: movieId,
        });

        if (existed) {
            return res.status(400).json({
                success: false,
                message: "Movie already in favourites",
            });
        }

        const favourite = await Favourite.create({
            user: userId,
            movie: movieId,
        });

        res.status(201).json({
            success: true,
            favourite,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

//Danh sách yêu thích
exports.getFavouriteMovies = async (req, res) => {

    try {

        const userId = req.user.id;

        const favourites = await Favourite.find({
            user: userId,
        }).populate("movie");

        res.json({
            success: true,
            movies: favourites,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

//Xóa yêu thích
exports.removeFavourite = async (req, res) => {

    try {

        const userId = req.user.id;
        const { movieId } = req.params;

        await Favourite.findOneAndDelete({
            user: userId,
            movie: movieId,
        });

        res.json({
            success: true,
            message: "Removed from favourites",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};