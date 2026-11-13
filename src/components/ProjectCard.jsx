import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const ProjectCard = ({ project, onClick, index }) => {
  // Map project to one of the abstract glass images from the Boreal HUD design
  const images = [
    "https://images.unsplash.com/photo-1709990740078-05aa8ee5b9b7?auto=format&w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1669295384050-a1d4357bd1d7?auto=format&w=600&q=80&fit=crop",
    "https://images.unsplash.com/photo-1708778002477-75611274f23d?auto=format&w=600&q=80&fit=crop"
  ];
  const cardImage = images[index % images.length];

  return (
    <div 
      className="target-box liquid-glass p-1 rounded-none border border-sensor/20 hover:border-sensor/50 transition-all flex flex-col h-full group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Area with Glass Refraction Overlay */}
      <div className="relative h-48 overflow-hidden mb-6 border-b border-sensor/10">
        <div className="absolute inset-0 bg-sensor/5 group-hover:bg-target/5 transition-colors duration-500 z-10" />
        <img 
          src={cardImage} 
          alt={project.title}
          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 text-xs font-mono bg-void/80 px-2.5 py-1 border border-sensor/30 text-sensor z-20 font-bold">
          LVL_0{(index % 9) + 1}
        </div>
      </div>
      
      <div className="p-6 pt-0 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4 gap-2">
          <h3 className="font-heading text-xl md:text-2xl text-white group-hover:text-target transition-colors tracking-wider break-words min-w-0">
            {project.title.toUpperCase().replace(/\s+/g, '_\u200B')}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-sensor/60 group-hover:text-target transition-colors flex-shrink-0 mt-1" />
        </div>
        
        <p className="text-phosphor/95 text-base md:text-lg mb-6 leading-relaxed flex-grow font-normal">
          {project.description}
        </p>
        
        <div className="mt-auto">
          {/* Technical Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 text-xs md:text-sm border border-sensor/30 text-sensor bg-sensor/5 font-mono uppercase tracking-tight font-medium">
                {tag.replace(/\s+/g, '_')}
              </span>
            ))}
          </div>
          
          {/* Card Footer with Telemetry Action */}
          <div className="flex justify-between items-center pt-4 border-t border-sensor/10">
            <span className="text-xs text-target font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">
              VIEW_TELEMETRY →
            </span>
            <div className="flex gap-4">
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-200 hover:text-sensor transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="GitHub Repository"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
              )}
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-200 hover:text-sensor transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Live Project"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
