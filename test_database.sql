-- Test Database Connection và tạo dữ liệu mẫu
-- Chạy script này để kiểm tra và tạo dữ liệu cần thiết

-- 1. Kiểm tra bảng User
SELECT 'User table check:' as info;
SELECT COUNT(*) as user_count FROM [User];
SELECT TOP 5 * FROM [User];

-- 2. Kiểm tra bảng Movie
SELECT 'Movie table check:' as info;
SELECT COUNT(*) as movie_count FROM Movie;
SELECT TOP 5 * FROM Movie;

-- 3. Kiểm tra bảng Comment
SELECT 'Comment table check:' as info;
SELECT COUNT(*) as comment_count FROM Comment;
SELECT TOP 5 * FROM Comment;

-- 4. Kiểm tra bảng Vote
SELECT 'Vote table check:' as info;
SELECT COUNT(*) as vote_count FROM Vote;
SELECT TOP 5 * FROM Vote;

-- 5. Tạo dữ liệu mẫu nếu cần

-- Tạo User mẫu nếu chưa có
IF NOT EXISTS (SELECT 1 FROM [User] WHERE Email = 'test@example.com')
BEGIN
    INSERT INTO [User] (Name, Email, Password, Role, CreatedAt)
    VALUES ('Test User', 'test@example.com', 'hashed_password', 'User', GETDATE());
    PRINT 'Created test user';
END

-- Tạo Movie mẫu nếu chưa có
IF NOT EXISTS (SELECT 1 FROM Movie WHERE Title = 'Test Movie')
BEGIN
    INSERT INTO Movie (Title, Description, Duration, Language, ReleaseDate, TrailerUrl, PosterUrl, CreatedAt)
    VALUES ('Test Movie', 'A test movie for API testing', 120, 'Vietnamese', '2024-01-01', 'https://youtube.com/watch?v=test', 'https://example.com/poster.jpg', GETDATE());
    PRINT 'Created test movie';
END

-- Tạo Comment mẫu
DECLARE @testUserId INT = (SELECT TOP 1 UserId FROM [User] WHERE Email = 'test@example.com');
DECLARE @testMovieId INT = (SELECT TOP 1 MovieId FROM Movie WHERE Title = 'Test Movie');

IF @testUserId IS NOT NULL AND @testMovieId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Comment WHERE UserId = @testUserId AND MovieId = @testMovieId)
    BEGIN
        INSERT INTO Comment (UserId, MovieId, CommentText, IsApproved, CreatedAt)
        VALUES (@testUserId, @testMovieId, 'This is a test comment for API testing', 1, GETDATE());
        PRINT 'Created test comment';
    END
END

-- Tạo Vote mẫu
IF @testUserId IS NOT NULL AND @testMovieId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Vote WHERE UserId = @testUserId AND MovieId = @testMovieId)
    BEGIN
        INSERT INTO Vote (UserId, MovieId, RatingValue, VoteTime)
        VALUES (@testUserId, @testMovieId, 5, GETDATE());
        PRINT 'Created test vote';
    END
END

-- 6. Kiểm tra lại sau khi tạo dữ liệu
SELECT 'After creating sample data:' as info;
SELECT 'Users:' as table_name, COUNT(*) as count FROM [User]
UNION ALL
SELECT 'Movies:', COUNT(*) FROM Movie
UNION ALL
SELECT 'Comments:', COUNT(*) FROM Comment
UNION ALL
SELECT 'Votes:', COUNT(*) FROM Vote;

-- 7. Test queries cho API
SELECT 'Test queries for API:' as info;

-- Test Comment API
SELECT 'Comments for movie 1:' as query_name;
SELECT c.CommentId, c.UserId, c.MovieId, c.CommentText, c.IsApproved, c.CreatedAt
FROM Comment c
WHERE c.MovieId = 1
ORDER BY c.CreatedAt DESC;

-- Test Vote API
SELECT 'Votes for movie 1:' as query_name;
SELECT v.VoteId, v.UserId, v.MovieId, v.RatingValue, v.VoteTime
FROM Vote v
WHERE v.MovieId = 1;

-- Test Vote Stats
SELECT 'Vote stats for movie 1:' as query_name;
SELECT 
    MovieId,
    COUNT(*) as TotalVotes,
    AVG(CAST(RatingValue AS FLOAT)) as AverageRating,
    COUNT(CASE WHEN RatingValue = 1 THEN 1 END) as OneStar,
    COUNT(CASE WHEN RatingValue = 2 THEN 1 END) as TwoStars,
    COUNT(CASE WHEN RatingValue = 3 THEN 1 END) as ThreeStars,
    COUNT(CASE WHEN RatingValue = 4 THEN 1 END) as FourStars,
    COUNT(CASE WHEN RatingValue = 5 THEN 1 END) as FiveStars
FROM Vote
WHERE MovieId = 1
GROUP BY MovieId; 