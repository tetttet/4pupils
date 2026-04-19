import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "lucide-react";

type FooterLink = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type FooterLinkGroup = {
  label: string;
  links: FooterLink[];
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: "Обучение",
    links: [
      { title: "Онлайн-курсы", href: "#" },
      { title: "Программы обучения", href: "#" },
      { title: "Профессии", href: "#" },
      { title: "Видеоуроки", href: "#" },
      { title: "Практические задания", href: "#" },
      { title: "Сертификаты", href: "#" },
      { title: "Карьерные треки", href: "#" },
      { title: "Прогресс обучения", href: "#" },
      { title: "Тесты и экзамены", href: "#" },
      { title: "Домашние задания", href: "#" },
      { title: "Обучение с наставником", href: "#" },
      { title: "Корпоративное обучение", href: "#" },
      { title: "Цены и тарифы", href: "#" },
    ],
  },
  {
    label: "Решения",
    links: [
      { title: "Для студентов", href: "#" },
      { title: "Для начинающих", href: "#" },
      { title: "Для профессионалов", href: "#" },
      { title: "Для компаний", href: "#" },
      { title: "Для команд", href: "#" },
      { title: "Для преподавателей", href: "#" },
      { title: "Для HR и рекрутеров", href: "#" },
      { title: "Онлайн-школам", href: "#" },
      { title: "Образовательным платформам", href: "#" },
      { title: "Университетам", href: "#" },
      { title: "Школам и колледжам", href: "#" },
      { title: "Госучреждениям", href: "#" },
      { title: "Некоммерческим организациям", href: "#" },
    ],
  },
  {
    label: "О платформе",
    links: [
      { title: "О школе", href: "#" },
      { title: "Команда", href: "#" },
      { title: "Карьера", href: "#" },
      { title: "Новости и пресс-релизы", href: "#" },
      { title: "Социальная ответственность", href: "#" },
      { title: "Инклюзивность и доступность", href: "#" },
      { title: "Инвесторам", href: "#" },
      { title: "Партнёры", href: "#" },
      { title: "Юридическая информация", href: "#" },
      { title: "Политика конфиденциальности", href: "#" },
      { title: "Политика cookies", href: "#" },
      { title: "Пользовательское соглашение", href: "#" },
      { title: "Политика возврата", href: "#" },
      { title: "Правовая информация", href: "#" },
    ],
  },
];

export const socialLinks = [
  { title: "Facebook", href: "#", icon: FacebookIcon },
  { title: "Instagram", href: "#", icon: InstagramIcon },
  { title: "YouTube", href: "#", icon: YoutubeIcon },
  { title: "LinkedIn", href: "#", icon: LinkedinIcon },
];
