'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSongs, useAllArtists, useAllGenres } from '@/features/catalog/catalog.hooks';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function SearchIcon() {
  return (
    <svg
      className={styles.howItWorksIcon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="12" stroke="var(--accent-chord)" strokeWidth="2" />
      <line
        x1="29"
        y1="29"
        x2="40"
        y2="40"
        stroke="var(--accent-chord)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      className={styles.howItWorksIcon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="18" stroke="var(--accent-chord)" strokeWidth="1.5" />
      <polygon
        points="20,15 36,24 20,33"
        stroke="var(--accent-chord)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      className={styles.howItWorksIcon}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 32V12" stroke="var(--accent-chord)" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 20L24 12L32 20"
        stroke="var(--accent-chord)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 28V38H40V28"
        stroke="var(--accent-chord)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  const { data: songsData, isLoading: songsLoading } = useSongs({
    limit: 20,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const { data: artists, isLoading: artistsLoading } = useAllArtists();
  const { data: genres, isLoading: genresLoading } = useAllGenres();
  const [artistSearch, setArtistSearch] = useState('');

  const isLoading = songsLoading || artistsLoading || genresLoading;

  const shuffledArtists = useMemo(() => {
    if (!artists) return [];
    return shuffle(artists).slice(0, 12);
  }, [artists]);

  const displayedArtists = useMemo(() => {
    if (!artistSearch.trim()) return shuffledArtists;
    if (!artists) return [];
    const query = artistSearch.toLowerCase();
    return artists.filter((a) => a.name.toLowerCase().includes(query));
  }, [artistSearch, artists, shuffledArtists]);

  const shuffledSongs = useMemo(() => {
    const songs = songsData?.pages?.[0]?.data;
    if (!songs) return [];
    return shuffle(songs).slice(0, 6);
  }, [songsData]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll(`.${styles.reveal}`);
    if (!elements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          TabSpot
        </Link>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.loginLink}>
            Log In
          </Link>
          <Link href="/register" className={styles.signupLink}>
            Sign Up
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <span className={`${styles.floatingNote} ${styles.floatingNote1}`} aria-hidden="true">
          &#9834;
        </span>
        <span className={`${styles.floatingNote} ${styles.floatingNote2}`} aria-hidden="true">
          &#9839;
        </span>
        <span className={`${styles.floatingNote} ${styles.floatingNote3}`} aria-hidden="true">
          &#9837;
        </span>
        <span className={`${styles.floatingNote} ${styles.floatingNote4}`} aria-hidden="true">
          &#9835;
        </span>
        <h1 className={styles.heroTitle}>
          Your Chords. Your <span className={styles.heroAccent}>Stage</span>.
        </h1>
        <p className={styles.heroSubtitle}>
          The definitive platform for chords, tabs, and scores. Find, play, and share music like
          never before.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/register" className={styles.ctaPrimary}>
            Get Started
          </Link>
          <Link href="/songs" className={styles.ctaSecondary}>
            Browse Catalog
          </Link>
        </div>
        <div className={styles.scrollIndicator} aria-hidden="true">
          <div className={styles.scrollLine}>
            <div className={styles.scrollDot} />
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {shuffledArtists.length > 0 && (
          <section className={`${styles.section} ${styles.reveal}`}>
            <h2 className={styles.sectionLabel}>Trending Artists</h2>
            <div className={styles.artistSearchWrapper}>
              <span className={styles.artistSearchIcon} aria-hidden="true">
                {'⌕'}
              </span>
              <input
                type="text"
                className={styles.artistSearchInput}
                placeholder="Search artists..."
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
              />
            </div>
            {displayedArtists.length > 0 ? (
              <div className={styles.artistsRowWrapper}>
                <div className={styles.artistsRow}>
                  {displayedArtists.map((artist, index) => (
                    <Link
                      key={artist.id}
                      href={`/artists/${artist.slug}`}
                      className={styles.artistCardLink}
                      style={{ transitionDelay: `${index * 80}ms` }}
                    >
                      <div className={styles.artistAvatar}>
                        {artist.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.artistName}>{artist.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className={styles.artistNoResults}>No artists found</p>
            )}
          </section>
        )}

        {shuffledSongs.length > 0 && (
          <section className={`${styles.section} ${styles.reveal}`}>
            <h2 className={styles.sectionLabel}>Recently Added</h2>
            <div className={styles.songsGrid}>
              {shuffledSongs.map((song, index) => (
                <Link
                  key={song.id}
                  href={`/songs/${song.slug}`}
                  className={`${styles.songCard} ${styles.reveal}`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <p className={styles.songTitle}>{song.title}</p>
                  {song.subtitle && <p className={styles.songSubtitle}>{song.subtitle}</p>}
                  {song.releaseYear && (
                    <div className={styles.songMeta}>
                      <Badge variant="default">{song.releaseYear}</Badge>
                    </div>
                  )}
                  <span className={styles.songViewHint}>View &rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={`${styles.section} ${styles.reveal}`}>
          <h2 className={styles.sectionLabel}>How It Works</h2>
          <div className={styles.howItWorksGrid}>
            <div className={styles.howItWorksItem}>
              <SearchIcon />
              <p className={styles.howItWorksTitle}>Find</p>
              <p className={styles.howItWorksDesc}>
                Search through thousands of chords, tabs, and scores for your favorite songs.
              </p>
            </div>
            <div className={styles.howItWorksItem}>
              <PlayIcon />
              <p className={styles.howItWorksTitle}>Play</p>
              <p className={styles.howItWorksDesc}>
                Open any tab and start playing. Transpose chords on the fly with a single tap.
              </p>
            </div>
            <div className={styles.howItWorksItem}>
              <ShareIcon />
              <p className={styles.howItWorksTitle}>Share</p>
              <p className={styles.howItWorksDesc}>
                Contribute your own tabs and help the community grow.
              </p>
            </div>
          </div>
        </section>

        {genres && genres.length > 0 && (
          <section className={`${styles.section} ${styles.reveal}`}>
            <h2 className={styles.sectionLabel}>Browse by Genre</h2>
            <div className={styles.genreCloud}>
              {genres.map((genre, index) => (
                <Link
                  key={genre.id}
                  href={`/songs?genreId=${genre.id}`}
                  className={styles.genrePill}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className={`${styles.footerCta} ${styles.reveal}`}>
        <div className={styles.container}>
          <h2 className={styles.footerTitle}>Ready to start playing?</h2>
          <p className={styles.footerSubtitle}>
            Join thousands of musicians who trust TabSpot for their chords and tabs.
          </p>
          <Link href="/register" className={styles.ctaPrimary}>
            Sign Up Free
          </Link>
        </div>
      </footer>
    </div>
  );
}
