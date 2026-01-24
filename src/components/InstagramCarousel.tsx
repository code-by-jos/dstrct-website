import { Carousel } from '@/components/ui/Carousel';
import { InstagramPost, type InstagramPostData } from '@/components/InstagramPost';

// Mock Instagram data - replace with real API data later
const instagramPosts: InstagramPostData[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop',
    postUrl: 'https://www.instagram.com/fourmodels.nl',
    caption:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis volutpat, turpis sed mollis congue, orci orci eleifend orci, ut tempus eros magna non nunc. In laoreet lorem sapien, eget mattis ipsum venenatis in. Aenean efficitur scelerisque metus vulputate euismod. Ut id scelerisque ipsum. Praesent scelerisque vestibulum velit ac rutrum.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    postUrl: 'https://www.instagram.com/fourmodels.nl',
    caption:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis volutpat, turpis sed mollis congue, orci orci eleifend orci, ut tempus eros magna non nunc. In laoreet lorem sapien, eget mattis ipsum venenatis in. Aenean efficitur scelerisque metus vulputate euismod. Ut id scelerisque ipsum. Praesent scelerisque vestibulum velit ac rutrum.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    postUrl: 'https://www.instagram.com/fourmodels.nl',
    caption:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis volutpat, turpis sed mollis congue, orci orci eleifend orci, ut tempus eros magna non nunc. In laoreet lorem sapien, eget mattis ipsum venenatis in. Aenean efficitur scelerisque metus vulputate euismod. Ut id scelerisque ipsum. Praesent scelerisque vestibulum velit ac rutrum.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    postUrl: 'https://www.instagram.com/fourmodels.nl',
    caption:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis volutpat, turpis sed mollis congue, orci orci eleifend orci, ut tempus eros magna non nunc. In laoreet lorem sapien, eget mattis ipsum venenatis in. Aenean efficitur scelerisque metus vulputate euismod. Ut id scelerisque ipsum. Praesent scelerisque vestibulum velit ac rutrum.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=400&h=400&fit=crop',
    postUrl: 'https://www.instagram.com/fourmodels.nl',
    caption:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis volutpat, turpis sed mollis congue, orci orci eleifend orci, ut tempus eros magna non nunc. In laoreet lorem sapien, eget mattis ipsum venenatis in. Aenean efficitur scelerisque metus vulputate euismod. Ut id scelerisque ipsum. Praesent scelerisque vestibulum velit ac rutrum.',
  },
];

export function InstagramCarousel() {
  return (
    <Carousel itemWidthMobile={240} itemWidthDesktop={550}>
      {instagramPosts.map((post) => (
        <InstagramPost key={post.imageUrl} post={post} />
      ))}
    </Carousel>
  );
}
