import { NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '7012890f18msh1d9e4e7230d6f49p15a8b4jsn2aeb9d5078e9';

interface Course {
  id: string;
  name: string;
  title: string;
  platform: 'Coursera' | 'Udemy' | 'YouTube';
  partner?: string;
  university?: string;
  instructor?: string;
  rating?: number;
  reviews?: string;
  difficulty?: string;
  level?: string;
  duration?: string;
  enrolled?: string;
  description?: string;
  image?: string;
  url?: string;
  price?: string;
  thumbnail?: string;
}

async function fetchCoursera(query: string): Promise<Course[]> {
  try {
    const response = await fetch(
      `https://coursera-course-info.p.rapidapi.com/courses?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'coursera-course-info.p.rapidapi.com',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const courses = Array.isArray(data) ? data : data.courses || [];
      
      // Filter for top-rated courses only
      const topRatedCourses = courses.filter((course: any) => 
        (course.rating || 0) >= 4.5 || (course.enrolled || '0').includes('K') || (course.enrolled || '0').includes('M')
      );
      
      return (topRatedCourses.length > 0 ? topRatedCourses : courses).slice(0, 3).map((course: any) => {
        // Extract proper thumbnail
        const thumbnailUrl = course.image || 
                            course.imageUrl || 
                            course.photoUrl ||
                            course.s12nLogo ||
                            `https://via.placeholder.com/400x250/0891b2/ffffff?text=${encodeURIComponent(course.name || query)}`;
        
        return {
          id: `coursera-${course.id || Math.random()}`,
          name: course.name || course.title,
          title: course.name || course.title,
          platform: 'Coursera' as const,
          partner: course.partner || course.university,
          university: course.university,
          rating: course.rating || 4.7,
          reviews: course.reviews || '10K+',
          difficulty: course.difficulty || course.level || 'Intermediate',
          duration: course.duration || '1-3 months',
          enrolled: course.enrolled || '50K+',
          description: course.description || course.summary || `Master ${query} with this comprehensive course`,
          image: thumbnailUrl,
          thumbnail: thumbnailUrl,
          url: course.url || course.link || `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
        };
      });
    }
  } catch (error) {
    console.error('Coursera fetch error:', error);
  }
  return [];
}

async function fetchUdemy(query: string): Promise<Course[]> {
  try {
    const response = await fetch(
      `https://udemy-course-scrapper-api.p.rapidapi.com/course-search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'udemy-course-scrapper-api.p.rapidapi.com',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const courses = Array.isArray(data) ? data : data.results || data.courses || [];
      
      // Filter for highly rated courses (4.5+ rating)
      const topRatedCourses = courses.filter((course: any) => 
        (course.rating || course.avg_rating || 0) >= 4.5
      );
      
      return (topRatedCourses.length > 0 ? topRatedCourses : courses).slice(0, 3).map((course: any) => {
        // Extract best quality thumbnail
        const thumbnailUrl = course.image_480x270 || 
                            course.image_750x422 ||
                            course.image_304x171 ||
                            course.image || 
                            course.thumbnail ||
                            `https://via.placeholder.com/400x250/f59e0b/ffffff?text=${encodeURIComponent(course.title || query)}`;
        
        return {
          id: `udemy-${course.id || Math.random()}`,
          name: course.title || course.name,
          title: course.title || course.name,
          platform: 'Udemy' as const,
          instructor: course.instructor || course.visible_instructors?.[0]?.display_name || 'Expert Instructor',
          rating: course.rating || course.avg_rating || 4.6,
          reviews: course.num_reviews || course.reviews || '5K+',
          difficulty: course.level || course.difficulty || 'All Levels',
          duration: course.content_length_text || course.duration || '20+ hours',
          enrolled: course.num_subscribers || course.enrolled || '50K+',
          description: course.headline || course.description || `Comprehensive ${query} course with hands-on projects`,
          image: thumbnailUrl,
          thumbnail: thumbnailUrl,
          url: course.url || `https://www.udemy.com/course/${course.slug || ''}` || `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
          price: course.price || course.price_detail?.amount || '$84.99',
        };
      });
    }
  } catch (error) {
    console.error('Udemy fetch error:', error);
  }
  return [];
}

async function fetchYouTube(query: string): Promise<Course[]> {
  try {
    const response = await fetch(
      `https://youtube-search-and-download.p.rapidapi.com/search?query=${encodeURIComponent(query + ' tutorial complete course')}&type=video&sort_by=rating`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'youtube-search-and-download.p.rapidapi.com',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const videos = Array.isArray(data) ? data : data.contents || data.items || [];
      
      // Filter for highly rated tutorial videos
      const topRatedVideos = videos.filter((video: any) => {
        const viewCount = parseInt(video.viewCountText?.replace(/[^0-9]/g, '') || '0');
        return viewCount > 10000; // Only videos with 10K+ views
      });
      
      return topRatedVideos.slice(0, 3).map((video: any) => {
        // Extract proper thumbnail URL
        const thumbnailUrl = video.thumbnail?.[0]?.url || 
                            video.thumbnails?.[0]?.url || 
                            video.snippet?.thumbnails?.maxres?.url ||
                            video.snippet?.thumbnails?.high?.url ||
                            video.snippet?.thumbnails?.medium?.url ||
                            `https://i.ytimg.com/vi/${video.videoId || video.id?.videoId}/maxresdefault.jpg`;
        
        return {
          id: `youtube-${video.videoId || video.id?.videoId || Math.random()}`,
          name: video.title || video.snippet?.title,
          title: video.title || video.snippet?.title,
          platform: 'YouTube' as const,
          instructor: video.channelTitle || video.channelName || video.snippet?.channelTitle,
          rating: 4.8,
          reviews: video.viewCountText || video.viewCount || video.statistics?.viewCount || '10K+ views',
          duration: video.lengthText || video.duration || '2-4 hours',
          description: video.descriptionSnippet || video.description || video.snippet?.description || `Learn ${query} with this comprehensive tutorial`,
          image: thumbnailUrl,
          thumbnail: thumbnailUrl,
          url: video.link || `https://www.youtube.com/watch?v=${video.videoId || video.id?.videoId}`,
        };
      });
    }
  } catch (error) {
    console.error('YouTube fetch error:', error);
  }
  return [];
}

function generateMockCourses(query: string): Course[] {
  return [
    // Coursera
    {
      id: 'coursera-1',
      name: `${query} Specialization`,
      title: `Professional Certificate in ${query}`,
      platform: 'Coursera',
      partner: 'Google',
      university: 'Stanford University',
      rating: 4.8,
      reviews: '25.4K',
      difficulty: 'Intermediate',
      duration: '3-6 months',
      enrolled: '500K+',
      description: `Master ${query} with hands-on projects and real-world applications. Learn from industry experts and gain practical skills.`,
      image: `https://via.placeholder.com/400x250/0891b2/ffffff?text=${encodeURIComponent(query)}`,
      url: `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
    },
    {
      id: 'coursera-2',
      name: `${query} Fundamentals`,
      title: `Introduction to ${query}`,
      platform: 'Coursera',
      partner: 'IBM',
      rating: 4.7,
      reviews: '18.2K',
      difficulty: 'Beginner',
      duration: '2-4 months',
      enrolled: '300K+',
      description: `Start your journey in ${query}. Perfect for beginners with step-by-step guidance.`,
      image: `https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Beginner+${encodeURIComponent(query)}`,
      url: `https://www.coursera.org/search?query=beginner+${encodeURIComponent(query)}`,
    },
    // Udemy
    {
      id: 'udemy-1',
      name: `Complete ${query} Bootcamp 2025`,
      title: `The Complete ${query} Course`,
      platform: 'Udemy',
      instructor: 'Dr. Angela Yu',
      rating: 4.9,
      reviews: '125K',
      difficulty: 'All Levels',
      duration: '42 hours',
      enrolled: '450K+',
      description: `From beginner to advanced - learn ${query} through practical projects and real-world examples.`,
      image: `https://via.placeholder.com/400x250/f59e0b/ffffff?text=Udemy+${encodeURIComponent(query)}`,
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
      price: '$84.99',
    },
    {
      id: 'udemy-2',
      name: `${query} Masterclass`,
      title: `Advanced ${query} Training`,
      platform: 'Udemy',
      instructor: 'Jose Portilla',
      rating: 4.8,
      reviews: '89K',
      difficulty: 'Advanced',
      duration: '36 hours',
      enrolled: '320K+',
      description: `Advanced techniques and best practices in ${query}. Build professional-grade projects.`,
      image: `https://via.placeholder.com/400x250/10b981/ffffff?text=Advanced+${encodeURIComponent(query)}`,
      url: `https://www.udemy.com/courses/search/?q=advanced+${encodeURIComponent(query)}`,
      price: '$79.99',
    },
    // YouTube
    {
      id: 'youtube-1',
      name: `${query} Full Course - Free Tutorial`,
      title: `Learn ${query} - Complete Course`,
      platform: 'YouTube',
      instructor: 'freeCodeCamp.org',
      rating: 4.9,
      reviews: '2.5M views',
      duration: '4:25:30',
      description: `Comprehensive ${query} tutorial covering everything from basics to advanced concepts. Perfect for beginners.`,
      image: `https://via.placeholder.com/400x250/ef4444/ffffff?text=YouTube+${encodeURIComponent(query)}`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`,
    },
    {
      id: 'youtube-2',
      name: `${query} Project Tutorial`,
      title: `Build Real ${query} Projects`,
      platform: 'YouTube',
      instructor: 'Traversy Media',
      rating: 4.8,
      reviews: '1.8M views',
      duration: '3:15:45',
      description: `Learn ${query} by building actual projects. Hands-on coding tutorial with practical examples.`,
      image: `https://via.placeholder.com/400x250/a855f7/ffffff?text=Projects`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' projects')}`,
    },
  ];
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'programming';
    
    console.log('Fetching courses for:', query);

    // Fetch from all platforms in parallel
    const [courseraResults, udemyResults, youtubeResults] = await Promise.all([
      fetchCoursera(query),
      fetchUdemy(query),
      fetchYouTube(query),
    ]);

    // Combine all results
    let allCourses = [...courseraResults, ...udemyResults, ...youtubeResults];

    // If no real data, use mock data
    if (allCourses.length === 0) {
      console.log('No real data found, using mock courses');
      allCourses = generateMockCourses(query);
    }

    // Shuffle and return courses
    const shuffled = allCourses.sort(() => Math.random() - 0.5);
    
    return NextResponse.json(shuffled);
  } catch (error: any) {
    console.error('Error in courses API:', error);
    const query = new URL(request.url).searchParams.get('query') || 'programming';
    return NextResponse.json(generateMockCourses(query));
  }
}
