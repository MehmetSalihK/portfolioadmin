import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiBriefcase, FiMapPin, FiCalendar, FiExternalLink } from 'react-icons/fi';

interface Experience {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  companyUrl?: string;
  isCurrentPosition?: boolean;
}

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM yyyy', { locale: fr });
  };

  return (
    <section className="py-20 bg-[#111827]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Expérience Professionnelle
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Ligne verticale de timeline */}
            <div className="absolute left-0 md:left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-500/30" />

            {experiences.map((experience, index) => (
              <div key={experience._id} className="relative mb-12">
                {/* Point sur la timeline */}
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-[#111827]" />
                
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:ml-auto' : 'md:pl-12'}`}>
                  <div className="bg-[#1E1E1E] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex flex-col space-y-4">
                      {/* En-tête */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{experience.title}</h3>
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <FiBriefcase className="flex-shrink-0" />
                          <span className="font-medium">
                            {experience.company}
                            {experience.companyUrl && (
                              <a 
                                href={experience.companyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center ml-2 text-blue-400 hover:text-blue-300"
                              >
                                <FiExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <FiMapPin className="flex-shrink-0" />
                          <span>{experience.location}</span>
                        </div>
                      </div>

                      {/* Période */}
                      <div className="flex items-center gap-2 text-gray-400">
                        <FiCalendar className="flex-shrink-0" />
                        <span>
                          {formatDate(experience.startDate)}
                          {' - '}
                          {experience.isCurrentPosition 
                            ? 'Présent'
                            : experience.endDate 
                              ? formatDate(experience.endDate)
                              : ''
                          }
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 whitespace-pre-line">
                        {experience.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 