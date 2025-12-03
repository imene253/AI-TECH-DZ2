export const courses = [
  {
    id: "c1",
    category: "programming",
    title: "تطبيق باستخدام فلاتر",
    subtitle: "ابنِ تطبيقك الأول",
    image: "/images/course-img-1.png",
    duration: "08 hr 12 mins",
    author: "بالحاج",
    teacherPhoto: "/images/teacherphoto1.png",
    price: "$17.84",
    description:
      "سوف تتعلم في هذه الدورة أساسيات فلاتر وبناء تطبيقك الأول خطوة بخطوة مع أمثلة عملية.",
    
  },
  {
    id: "c2",
    category: "Design",
    title: "Figma تصميم واجهات",
    subtitle: "احصول على وظيفة في تصميم واجهة المستخدم",
    image: "/images/course-img-2.png",
    duration: "08 hr 12 mins",
    author: "شيروف",
    teacherPhoto: "/images/teacherphoto2.png",
    price: "$17.84",
    description:
      "تعلم المبادئ الأساسية لتصميم واجهات المستخدم باستخدام Figma وبناء نماذج أولية احترافية.",
    
  },
  {
    id: "c3",
    category: "programming",
    title: "موقعك الأول باستخدام React",
    subtitle: "ابدأ ببناء موقعك اليوم",
    image: "/images/course-img-3.png",
    duration: "08 hr 12 mins",
    author: "بوخميس",
    teacherPhoto: "/images/teacherphoto3.png",
    price: "$29.0",
    tag: "Free",
    description:
      "ستتعلم إنشاء تطبيقات واجهة أمامية باستخدام React مع التركيز على المكونات والحالة والتوجيه.",
   
  },
];

export const getCourseById = (id) => courses.find((c) => c.id === id);


