-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Create policies for blog image uploads
CREATE POLICY "Blog images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anyone can update blog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can delete blog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blog-images');