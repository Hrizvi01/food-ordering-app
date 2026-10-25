
-- Foods table ka tamam data hasil karo
SELECT * FROM foods;

-- Sirf Pizza ka record hasil karo
SELECT * FROM foods WHERE name = 'Pizza';

-- 600 se kam price wale food items hasil karo
SELECT * FROM foods WHERE price < 600;

-- Foods ko price ke hisaab se arrange karo
SELECT * FROM foods ORDER BY price ASC;
