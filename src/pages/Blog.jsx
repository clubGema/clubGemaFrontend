import React, { useState, useEffect } from 'react';
import {
  Calendar, User, ArrowRight, Trophy,
  Zap, Clock, Megaphone, Loader2, Star,
  Award, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { THEME_ASSETS } from "../config/themeAssets.js";


const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
      const result = await response.json();
      if (response.ok) {
        const ordenadas = (result.data || []).sort((a, b) =>
          new Date(b.creado_en) - new Date(a.creado_en)
        );
        setPosts(ordenadas);
        setFeaturedPost(ordenadas[0]);
      }
    } catch (error) {
      console.error("Error al cargar el blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const handleSelectPost = (post) => {
    setFeaturedPost(post);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-primary-dark">
      <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
      <p className="font-black text-white uppercase italic text-xs tracking-widest">ADN IMPERIO 7 CARGANDO...</p>
    </div>
  );

  return (
    <div className="bg-brand-surface min-h-screen font-sans text-brand-heading overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative bg-brand-primary-dark min-h-[45vh] md:min-h-[50vh] flex items-center py-8 md:py-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-brand-accent/15 blur-[130px] rounded-full"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-brand-primary/30 blur-[130px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-8 backdrop-blur-md">
            <Trophy size={16} className="text-brand-accent" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Muro de Noticias Oficial</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
            ADN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-brand-accent to-amber-400">IMPERIO 7</span>
          </h1>
          <p className="mt-8 text-stone-300 max-w-2xl mx-auto text-lg font-medium italic">
            "Donde el talento se encuentra con la disciplina para crear leyendas."
          </p>
        </div>
      </section>

      {/* --- ARTÍCULO DESTACADO DINÁMICO --- */}
      {featuredPost && (
        <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6">
          <div className="bg-brand-surface rounded-[50px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-brand-border-soft flex flex-col lg:flex-row group transition-all duration-500 hover:border-brand-accent/40">
            <div className="lg:w-1/2 h-[400px] lg:h-auto overflow-hidden bg-brand-surface-alt relative">
              <img
                src={featuredPost.imagen_url || "https://images.unsplash.com/photo-1592656094267-764a45160876?w=1200"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                alt="Destacado"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            </div>
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center space-y-8">
              <div className="flex items-center gap-3 text-brand-accent-dark">
                <TrendingUp size={22} strokeWidth={3} />
                <span className="text-sm font-black uppercase tracking-[0.2em]">Lectura Principal</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-brand-primary uppercase italic tracking-tighter leading-[0.9]">
                {featuredPost.titulo}
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed italic line-clamp-4">
                {featuredPost.contenido}
              </p>
              <div className="flex items-center gap-8 text-brand-muted text-xs font-bold uppercase tracking-widest pt-8 border-t border-brand-border-soft">
                <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(featuredPost.creado_en).toLocaleDateString()}</span>
                <div className="flex items-center gap-3 text-brand-primary">
                  {/* LOGO MÁS GRANDE CON FONDO BLANCO */}
                  <div className="w-12 h-12 bg-brand-surface border-2 border-brand-border-soft rounded-2xl p-1.5 shadow-md">
                    <img src={THEME_ASSETS.logoFramed} alt="Imperio 7" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black italic text-sm">Imperio 7 Oficial</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- GRID DE NOTICIAS --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex items-center gap-4 mb-20">
          <div className="h-12 w-3 bg-brand-accent rounded-full shadow-accent-bar"></div>
          <h2 className="text-5xl font-black text-brand-primary uppercase italic tracking-tighter">Muro de Campeones</h2>
        </div>

        {posts.length === 0 ? (
          <div className="bg-brand-bg rounded-[3rem] p-24 text-center border-4 border-dashed border-brand-border">
            <Megaphone className="mx-auto text-slate-200 mb-4" size={80} />
            <p className="font-black text-brand-muted uppercase italic text-xl">Preparando nuevas noticias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className={`bg-brand-surface rounded-[50px] border-2 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 flex flex-col group ${featuredPost?.id === post.id ? 'border-brand-accent ring-4 ring-brand-accent/10' : 'border-slate-50'}`}
              >
                <div className="h-72 relative overflow-hidden bg-brand-surface-alt">
                  <img
                    src={post.imagen_url || "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={post.titulo}
                  />
                  {/* LOGO EN CARDS: MÁS GRANDE Y FONDO BLANCO */}
                  <div className="absolute top-6 left-6 bg-brand-surface px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl border border-brand-border-soft">
                    <div className="w-8 h-8 bg-brand-surface rounded-lg p-0.5">
                      <img src={THEME_ASSETS.logoFramed} alt="Imperio 7" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-brand-primary italic tracking-widest">Imperio 7 News</span>
                  </div>
                </div>

                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-brand-muted text-[11px] font-black uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.creado_en).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-black text-brand-primary uppercase italic tracking-tighter group-hover:text-brand-accent transition-colors line-clamp-2 leading-none mb-6">
                    {post.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic line-clamp-3 mb-8">
                    {post.contenido}
                  </p>
                  <div className="pt-8 mt-auto border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-brand-accent">
                      <Award size={16} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase italic tracking-tighter">Formando Campeones</span>
                    </div>
                    <button className="text-brand-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group-hover:text-brand-accent-dark">
                      Leer <ArrowRight size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;