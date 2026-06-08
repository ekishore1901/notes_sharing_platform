-- Functions for incrementing note stats
CREATE OR REPLACE FUNCTION increment_note_views(note_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notes SET views = views + 1 WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_note_downloads(note_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notes SET downloads = downloads + 1 WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get average rating for a note
CREATE OR REPLACE FUNCTION get_note_avg_rating(note_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT AVG(rating) INTO avg_rating
  FROM ratings
  WHERE ratings.note_id = get_note_avg_rating.note_id;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;