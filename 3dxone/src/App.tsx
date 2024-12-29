import { useState, useEffect, useCallback } from 'react';
import { getCurrent } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/api/shell';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { motion } from "framer-motion";
import { cn } from "./lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"
import {
  BellIcon, ShieldIcon, FlagIcon, MessageSquareIcon, WrenchIcon, DownloadIcon, LinkIcon, ExternalLinkIcon, GithubIcon, YoutubeIcon, BookIcon, ShoppingBagIcon, ShareIcon, PuzzleIcon, CalendarIcon, NewspaperIcon, ActivityIcon, BookOpenIcon, UserIcon, Settings2Icon, KeyboardIcon, Brush as PaintBrushIcon, InfoIcon
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css';
import { WelcomePage } from './components/WelcomePage'

interface Event {
  title: string;
  details: string;
  image: string;
  link: string;
  tags: string;
  start: string;
  end: string;
  author: string;
}

interface NewsAttachment {
  url: string;
  type: string;
}

interface News {
  title: string;
  description: string;
  profileName: string;
  profileImage: string;
  url: string;
  messageID: string;
  channelID: string;
  guildID: string;
  attachments: NewsAttachment[];
  embed: any;
}

interface Tool {
  name: string;
  description: string;
  url: string;
  icon: JSX.Element;
  category: 'modeling' | 'texturing' | 'animation' | 'utility' | 'learning';
}

// Sample event for testing
const sampleEvent: Event = {
  title: "UMBRELLA THE HIVE (4 Live Techno DJs)",
  details: "Get ready for the HIVE - out last pure Techno party this year... so no HO HO HO... just UTZ UTZ UTZ ! Join us!!!",
  image: "https://i.postimg.cc/0QTZJj78/THE-HIVE-PROMO-POSTER.png",
  link: "https://discordapp.com/events/698317734773260328/1315636932709187664",
  tags: "Umbrella, Techno, Hot Wolves Sex, Shield",
  start: "2024-12-11T20:00:00.000Z",
  end: "2024-12-12T00:00:00.000Z",
  author: "Chloe"
};

const tools = [
  {
    name: '3DX Wiki',
    description: 'Comprehensive guides and tutorials for 3DXChat',
    url: 'https://www.3dxchatwiki.com/',
    icon: <BookOpenIcon className="h-6 w-6" />,
    category: 'learning'
  },
  {
    name  : "3DX Tools",
    description: "Simple tools for the World Editor in 3DX. Live preview poses and generate your own!",
    icon: <Settings2Icon className="h-8 w-8" />,
    buttonText: "Visit Tool",
    url: "https://3dxtools.net/"
  },
  {
    name: "3DXChat Store",
    description: "Discover new poses, furniture, party clubs, and objects. Download and play today!",
    icon: <ShoppingBagIcon className="h-8 w-8" />,
    buttonText: "Visit Store",
    url: "https://3dxchatstore.com/"
  },
  {
    name: "3DXChat Sharing",
    description: "Share and download poses and projects. Join the 3DXChat community!",
    icon: <ShareIcon className="h-8 w-8" />,
    buttonText: "Visit",
    url: "https://www.3dxchatsharing.com/"
  },
  {
    name: "3DXModz",
    description: "Your one-stop destination for all modding resources.",
    icon: <PuzzleIcon className="h-8 w-8" />,
    buttonText: "Visit",
    url: "https://3dxmodz.com/"
  },
  {
    name: "Discord Builders Community",
    description: "Join our Discord community to connect with other users and get support.",
    icon: <MessageSquareIcon className="h-8 w-8" />,
    buttonText: "Join Builder's Corner Discord",
    url: "https://discord.gg/pbCBfuR99t"
  }
];

function formatDate(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString()}, ${startDate.toLocaleTimeString()} - ${endDate.toLocaleDateString()}, ${endDate.toLocaleTimeString()}`;
}

const themeColors = {
  Main: { background: '#0a0f1acc', font: '#fe3752' },
  Classic: { background: '#0D171Dcc', font: '#FFFFFF' },
  Purple: { background: '#5c5169cc', font: '#c8627d' },
  Grey: { background: '#70768acc', font: '#fffeff' },
  Red: { background: '#9f5a5acc', font: '#e3c7d7' },
  Green: { background: '#4a5449cc', font: '#c4c63c' },
  Pink: { background: '#ae6b8dcc', font: '#e5eb11' },
} as const;

type ThemeColor = keyof typeof themeColors;

function App() {
  const getInitialTheme = (): ThemeColor => {
    const savedTheme = localStorage.getItem('theme') as ThemeColor;
    return (savedTheme && themeColors[savedTheme]) ? savedTheme : 'Main';
  };

  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([sampleEvent]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'app' | 'appearance' | 'shortcuts' | 'about'>('app');
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(getInitialTheme());
  const [isWindowHidden, setIsWindowHidden] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const applyTheme = useCallback((theme: ThemeColor) => {
    const { background, font } = themeColors[theme];
    const root = document.documentElement;
    
    root.style.setProperty('--background', background);
    root.style.setProperty('--foreground', font);
    
    // Set all other variables to use the same colors
    root.style.setProperty('--card', background);
    root.style.setProperty('--card-foreground', font);
    root.style.setProperty('--popover', background);
    root.style.setProperty('--popover-foreground', font);
    root.style.setProperty('--primary', background);
    root.style.setProperty('--primary-foreground', font);
    root.style.setProperty('--secondary', background);
    root.style.setProperty('--secondary-foreground', font);
    root.style.setProperty('--muted', background);
    root.style.setProperty('--muted-foreground', font);
    root.style.setProperty('--accent', background);
    root.style.setProperty('--accent-foreground', font);
    root.style.setProperty('--destructive', background);
    root.style.setProperty('--destructive-foreground', font);
    root.style.setProperty('--border', font);
    root.style.setProperty('--input', font);
    root.style.setProperty('--ring', font);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, []);

  // Apply theme on mount and when changed
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  const handleThemeChange = (theme: ThemeColor) => {
    setCurrentTheme(theme);
  };

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'news') {
      fetchNews();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching events...');
      
      const response = await fetch('https://bunnybot.web.app/export', {
        method: 'GET',
        responseType: ResponseType.JSON,
      });

      console.log('Response:', response);
      
      if (response.ok) {
        const data = response.data;
        console.log('Fetched events:', data);
        
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (typeof data === 'object' && data !== null) {
          setEvents([data]);
        } else {
          throw new Error('Invalid data format received');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching news...');
      
      const response = await fetch('https://threedxone-news.onrender.com/news', {
        method: 'GET',
        responseType: ResponseType.JSON,
      });

      console.log('News Response:', response);
      
      if (response.ok) {
        const data = response.data;
        console.log('Fetched news:', data);
        
        if (Array.isArray(data)) {
          setNews(data);
        } else if (typeof data === 'object' && data !== null) {
          setNews([data]);
        } else {
          throw new Error('Invalid news data format received');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleMinimize = async () => {
    const window = await getCurrent();
    await window.minimize();
  };

  const handleClose = async () => {
    const window = await getCurrent();
    await window.close();
  };

  const startDragging = () => {
    const window = getCurrent();
    window.startDragging();
  };

  const handleEventClick = async (url: string) => {
    try {
      await open(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const renderEvents = () => (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {loading ? (
        <div className="loading">Loading events...</div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <p>Showing sample event instead:</p>
          {renderEventCards([sampleEvent])}
        </div>
      ) : (
        renderEventCards(events)
      )}
    </div>
  );

  const renderEventCards = (eventList: Event[]) => (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(350px,1fr))] auto-rows-max">
      {eventList.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="transform transition-all duration-200 hover:scale-[1.02]"
        >
          <Card 
            className="group h-full overflow-hidden backdrop-blur-sm transition-colors cursor-pointer border border-black/100 hover:border-black/20"
            onClick={() => handleEventClick(event.link)}
          >
            <CardHeader className="p-0">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  width={600}
                  height={400}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold leading-none tracking-tight" style={{ color: 'var(--foreground)' }}>{event.title}</h3>
              <p className="text-sm text-muted-foreground" style={{ color: 'var(--foreground)' }}>{event.details}</p>
              <p className="mt-2 text-sm text-muted-foreground" style={{ color: 'var(--foreground)' }}>
                {formatDate(event.start, event.end)}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 p-4 pt-0">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{event.author[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{event.author}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.split(',').map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="w-fit flex items-center gap-1 text-xs border border-[var(--border)]"
                  >
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const getNewsTypeAndIcon = (title: string): { type: string; icon: JSX.Element } => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('announcement') || lowerTitle.includes('📣')) {
      return { type: 'Announcement', icon: <BellIcon className="h-4 w-4" /> };
    }
    if (lowerTitle.includes('maintenance') || lowerTitle.includes('🛠')) {
      return { type: 'Maintenance', icon: <ShieldIcon className="h-4 w-4" /> };
    }
    if (lowerTitle.includes('update') || lowerTitle.includes('✨')) {
      return { type: 'Update', icon: <FlagIcon className="h-4 w-4" /> };
    }
    return { type: 'News', icon: <MessageSquareIcon className="h-4 w-4" /> };
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Announcement':
        return 'bg-blue-500';
      case 'Maintenance':
        return 'bg-amber-500';
      case 'Update':
        return 'bg-green-500';
      default:
        return 'bg-purple-500';
    }
  };

  const renderNews = () => (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {loading ? (
        <div className="loading">Loading news...</div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(350px,1fr))] auto-rows-max">
          {news.map((item) => {
            const { type, icon } = getNewsTypeAndIcon(item.title);
            return (
              <motion.div
                key={item.messageID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="transform transition-all duration-200 hover:scale-[1.02] h-full"
              >
                <Card className="overflow-hidden h-full flex flex-col bg-card/50 backdrop-blur-sm border border-black/100">
                  <div className={`h-1 ${getTypeColor(type)}`} />
                  <CardHeader className="flex flex-row items-center gap-4 p-6 pb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.profileImage} alt={item.profileName} />
                      <AvatarFallback>{item.profileName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="font-semibold">{item.profileName}</div>
                      <Badge variant="secondary" className="w-fit flex items-center gap-1 text-xs border border-[var(--border)]">
                        {icon}
                        {type}
                      </Badge>
                    </div>
                  </CardHeader>
                  {item.attachments?.length > 0 && (
                    <div className="px-6">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.attachments[0].url}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-2 flex-grow prose prose-invert max-w-none p-6">
                    <div className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{item.title}</div>
                    <div className="markdown-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        className="text-sm leading-relaxed"
                      >
                        {item.description}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs mt-auto p-6 pt-2">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View on Discord
                    </a>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTools = () => (
    <div className="h-full overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="transform transition-all duration-200 hover:scale-[1.02]"
        >
          <Card className="overflow-hidden h-full flex flex-col bg-card/50 backdrop-blur-sm border border-black/10">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 rounded-full bg-background/50">
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </CardHeader>
            <CardFooter className="mt-auto">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <button className="w-full py-2 px-4 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                  Visit
                  <ExternalLinkIcon className="h-4 w-4" />
                </button>
              </a>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'app':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">App Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between space-x-2">
                <span>Start with Windows</span>
                <input type="checkbox" className="form-checkbox" />
              </label>
              <label className="flex items-center justify-between space-x-2">
                <span>Start Minimized</span>
                <input type="checkbox" className="form-checkbox" />
              </label>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="block mb-2 text-lg font-medium">Theme</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(Object.keys(themeColors) as ThemeColor[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        currentTheme === theme
                          ? "ring-2 ring-offset-2 ring-offset-background"
                          : "hover:opacity-90",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                      )}
                      style={{
                        backgroundColor: themeColors[theme].background,
                        color: themeColors[theme].font,
                      }}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'shortcuts':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Toggle Window:</span>
                <kbd className="px-2 py-1 bg-muted rounded">Alt + Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>Settings:</span>
                <kbd className="px-2 py-1 bg-muted rounded">Ctrl + ,</kbd>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">About</h3>
            <p>3DXOne v1.0.0</p>
            <p>A powerful 3D model viewer and manager.</p>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return renderEvents();
      case 'news':
        return renderNews();
      case 'status':
        return (
          <iframe
            src="https://status.3dxchat.com/"
            className="w-full h-full border-none"
            title="3DX Status"
            style={{ minHeight: 'calc(100vh - 120px)' }}
          />
        );
      case 'tools':
        return renderTools();
      case 'profile':
        return (
          <iframe
            src="https://status.3dxchat.net/profile-editor"
            className="w-full h-full border-none"
            title="3DX Profile Editor"
            style={{ minHeight: 'calc(100vh - 120px)' }}
            ref={(iframe) => {
              if (iframe) {
                iframe.onload = () => {
                  try {
                    const checkNavigation = () => {
                      try {
                        const currentUrl = iframe.contentWindow?.location.href;
                        if (currentUrl && !currentUrl.startsWith('https://status.3dxchat.net/profile-editor')) {
                          iframe.contentWindow?.history.back();
                        }
                      } catch (error) {
                        // Ignore same-origin policy errors
                      }
                    };

                    // Add event listener for navigation attempts
                    iframe.contentWindow?.addEventListener('beforeunload', (e) => {
                      const currentUrl = iframe.contentWindow?.location.href;
                      if (currentUrl && !currentUrl.startsWith('https://status.3dxchat.net/profile-editor')) {
                        e.preventDefault();
                        e.returnValue = '';
                      }
                    });

                    // Monitor navigation changes
                    const observer = new MutationObserver(checkNavigation);
                    observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });
                  } catch (error) {
                    // Ignore same-origin policy errors
                  }
                };
              }
            }}
          />
        );
      default:
        return <div className="coming-soon">Coming Soon</div>;
    }
  };

  useEffect(() => {
    const setupWindow = async () => {
      const window = getCurrent();
      try {
        // Just handle window visibility
        if (isWindowHidden) {
          await window.hide();
        } else {
          await window.show();
          await window.setFocus();
        }
      } catch (err) {
        console.error('Error managing window:', err);
      }
    };

    setupWindow().catch(err => {
      console.error('Failed to setup window:', err);
    });

    return () => {
      // Cleanup if needed
    };
  }, [isWindowHidden]);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {showWelcome ? (
        <WelcomePage 
          onEnter={() => setShowWelcome(false)} 
          version="1.0.3"
        />
      ) : (
        <>
          <div 
            className="titlebar flex justify-between items-center px-2" 
            data-tauri-drag-region
          >
            <div className="titlebar-text">Version: 1.0.3</div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 border-0"
                    title="Settings"
                  >
                    <Settings2Icon className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4 py-4">
                    <div className="flex space-x-2 border-b pb-4">
                      <button
                        onClick={() => setActiveSettingsTab("app")}
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          activeSettingsTab === "app"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <WrenchIcon className="mr-2 h-4 w-4" />
                        App Settings
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab("appearance")}
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          activeSettingsTab === "appearance"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <PaintBrushIcon className="mr-2 h-4 w-4" />
                        Appearance
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab("shortcuts")}
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          activeSettingsTab === "shortcuts"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <KeyboardIcon className="mr-2 h-4 w-4" />
                        Shortcuts
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab("about")}
                        className={cn(
                          "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          activeSettingsTab === "about"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <InfoIcon className="mr-2 h-4 w-4" />
                        About
                      </button>
                    </div>
                    <div className="space-y-4 px-2">
                      {activeSettingsTab === "app" && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <label className="flex items-center justify-between space-x-2">
                              <span>Start with Windows</span>
                              <input type="checkbox" className="form-checkbox" />
                            </label>
                            <label className="flex items-center justify-between space-x-2">
                              <span>Start Minimized</span>
                              <input type="checkbox" className="form-checkbox" />
                            </label>
                          </div>
                        </div>
                      )}
                      {activeSettingsTab === "appearance" && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <span className="block mb-2 text-lg font-medium">Theme</span>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {(Object.keys(themeColors) as ThemeColor[]).map((theme) => (
                                  <button
                                    key={theme}
                                    onClick={() => handleThemeChange(theme)}
                                    className={cn(
                                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                      currentTheme === theme
                                        ? "ring-2 ring-offset-2 ring-offset-background"
                                        : "hover:opacity-90",
                                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                                    )}
                                    style={{
                                      backgroundColor: themeColors[theme].background,
                                      color: themeColors[theme].font,
                                    }}
                                  >
                                    {theme}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeSettingsTab === "shortcuts" && (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>Toggle Window:</span>
                              <kbd className="px-2 py-1 bg-muted rounded">Alt + Space</kbd>
                            </div>
                            <div className="flex justify-between">
                              <span>Settings:</span>
                              <kbd className="px-2 py-1 bg-muted rounded">Ctrl + ,</kbd>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeSettingsTab === "about" && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">About</h3>
                          <p className="text-sm text-muted-foreground">Version 1.0.3</p>
                          <p className="text-sm text-muted-foreground">3DX ONE by KINKYDEVS.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMinimize();
                }}
                className="p-1 hover:bg-white/10 rounded-sm transition-colors border-0"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="text-white"
                >
                  <path
                    fill="currentColor"
                    d="M0 4h10v2H0z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="p-1 hover:bg-white/10 rounded-sm transition-colors border-0 hover:bg-red-500/50"
              >
                <img 
                  src="https://img.icons8.com/ios-filled/50/FA5252/running.png"
                  alt="exit"
                  className="w-4 h-4 invert"
                />
              </button>
            </div>
          </div>

          <div 
            className="w-full p-4 flex items-center border-b relative"
          >
            <img
              src="/3DX_ONE_LOGO_TRANSPARENT.png"
              alt="3DX ONE"
              className="h-8 w-auto object-contain absolute left-4"
            />
            <nav className="flex gap-4 mx-auto">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 ${
                  activeTab === 'events' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                Events
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 ${
                  activeTab === 'news' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <NewspaperIcon className="h-4 w-4" />
                News
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 ${
                  activeTab === 'status' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <ActivityIcon className="h-4 w-4" />
                Status
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 ${
                  activeTab === 'tools' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Settings2Icon className="h-4 w-4" />
                Tools
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 ${
                  activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                Profile Editor
              </button>
            </nav>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'news' && renderNews()}
            {activeTab === 'tools' && renderTools()}
            {activeTab === 'status' && (
              <iframe
                src="https://status.3dxchat.com/"
                className="w-full h-full border-none"
                title="3DX Status"
                style={{ minHeight: 'calc(100vh - 120px)' }}
              />
            )}
            {activeTab === 'profile' && (
              <iframe
                src="https://status.3dxchat.net/profile-editor"
                className="w-full h-full border-none"
                title="3DX Profile Editor"
                style={{ minHeight: 'calc(100vh - 120px)' }}
                ref={(iframe) => {
                  if (iframe) {
                    iframe.onload = () => {
                      try {
                        const checkNavigation = () => {
                          try {
                            const currentUrl = iframe.contentWindow?.location.href;
                            if (currentUrl && !currentUrl.startsWith('https://status.3dxchat.net/profile-editor')) {
                              iframe.contentWindow?.history.back();
                            }
                          } catch (error) {
                            // Ignore same-origin policy errors
                          }
                        };

                        // Add event listener for navigation attempts
                        iframe.contentWindow?.addEventListener('beforeunload', (e) => {
                          const currentUrl = iframe.contentWindow?.location.href;
                          if (currentUrl && !currentUrl.startsWith('https://status.3dxchat.net/profile-editor')) {
                            e.preventDefault();
                            e.returnValue = '';
                          }
                        });

                        // Monitor navigation changes
                        const observer = new MutationObserver(checkNavigation);
                        observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });
                      } catch (error) {
                        // Ignore same-origin policy errors
                      }
                    };
                  }
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
