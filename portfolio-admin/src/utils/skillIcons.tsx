import { IconType } from 'react-icons';
import { 
  FaDocker, 
  FaJava, 
  FaPython, 
  FaWindows, 
  FaWordpress,
  FaGit,
  FaCode,
  FaDatabase,
  FaGithub,
  FaGitlab,
  FaLinux,
  FaHtml5,
  FaCss3,
  FaReact,
  FaNode,
  FaAws,
  FaVuejs,
  FaKeycdn
} from 'react-icons/fa';
import { 
  SiTypescript, 
  SiJavascript,
  SiMongodb,
  SiMariadb,
  SiVisualstudiocode,
  SiFigma,
  SiCanva,
  SiVirtualbox,
  SiDebian,
  SiPostgresql,
  SiMysql,
  SiFlutter,
  SiExpress,
  SiGooglecloud,
  SiKalilinux,
  SiNextdotjs,
  SiReact,
  SiHtml5 as HtmlIcon,
  SiCss3 as CssIcon
} from 'react-icons/si';
import { TbApi } from 'react-icons/tb';

const iconMap: { [key: string]: IconType } = {
  'JavaScript': SiJavascript,
  'TypeScript': SiTypescript,
  'Python': FaPython,
  'Docker': FaDocker,
  'API': TbApi,
  'API REST': TbApi,
  'Endpoints': TbApi,
  'WordPress': FaWordpress,
  'VS CODE': SiVisualstudiocode,
  'Canva': SiCanva,
  'Windows': FaWindows,
  'Figma': SiFigma,
  'Git': FaGit,
  'GitHub': FaGithub,
  'GitLab': FaGitlab,
  'VirtualBox': SiVirtualbox,
  'MongoDB': SiMongodb,
  'MariaDB': SiMariadb,
  'MySQL': SiMysql,
  'PostgreSQL': SiPostgresql,
  'Debian': SiDebian,
  'Linux': FaLinux,
  'Kali Linux': SiKalilinux,
  'HTML': HtmlIcon,
  'CSS': CssIcon,
  'React.js': FaReact,
  'Next.js': SiNextdotjs,
  'Flutter': SiFlutter,
  'Express Js': SiExpress,
  'Node.js': FaNode,
  'SQL': FaDatabase,
  'Google Cloud': SiGooglecloud,
  'AWS': FaAws,
  'Vue.js': FaVuejs,
  'React Native': SiReact,
  'Keynote': FaKeycdn
};

const SKILL_MAPPINGS: { [key: string]: string } = {
  'html': 'HTML',
  'html5': 'HTML',
  'HTML5': 'HTML',
  'HTML': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'CSS3': 'CSS',
  'CSS': 'CSS',
};

export function getSkillIcon(skillName: string): IconType {
  const normalizedSkill = normalizeSkillName(skillName);
  return iconMap[normalizedSkill] || FaCode;
}

export function normalizeSkillName(input: string): string {
  return SKILL_MAPPINGS[input] || SKILL_MAPPINGS[input.toLowerCase()] || input;
} 