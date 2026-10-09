export type Testimony = {
  id: string;
  category: "Healing" | "Breakthroughs" | "Deliverance" | "Salvation" | "Provision";
  title: string;
  excerpt: string;
  fullStory: string;
  date: string; // YYYY-MM-DD
  images?: string[]; // Optional array of image paths
  author: {
    name: string;
    location: string;
    avatar?: string;
  };
};

export const testimonies: Testimony[] = [
  {
    id: "healed-of-fibroid",
    category: "Healing",
    title: "Healed Of Fibroid During Healing School",
    excerpt:
      "\u201CSince last year, I had been living with fibroid and trusting God for my healing. During the July 2026 Week of Spiritual Renewal (WOSR) Healing School, a lady came forward to testify...\u201D",
    fullStory:
      "\u201CSince last year, I had been living with fibroid and trusting God for my healing. During the July 2026 Week of Spiritual Renewal (WOSR) Healing School, a lady came forward to testify of her healing from fibroid. As she testified, the man of God, Pastor Joseph M. Nwunuji, declared that whoever had the same condition would receive their healing. At that moment, I felt something move in my body, and I knew God had touched me. I went for a medical checkup, and the results confirmed that the fibroid was completely gone! Glory to God!\u201D",
    date: "2026-07-15",
    author: {
      name: "Ibinabo Jim brown",
      location: "River State Bonny",
    },
  },
  {
    id: "persistent-head-pain-healed",
    category: "Healing",
    title: "Over A Year Of Persistent Head Pain Completely Healed",
    excerpt:
      "\u201CFor over a year, I experienced persistent pain in my head. Despite undergoing several medical tests, the results consistently showed that everything was normal, yet the pain and discomfort persisted...\u201D",
    fullStory:
      "\u201CFor over a year, I experienced persistent pain in my head. Despite undergoing several medical tests, the results consistently showed that everything was normal, yet the pain and discomfort persisted. During one of our church services, Pastor prayed for the sick and declared healing in the name of Jesus. I received the prayer by faith, and from that day, the pain completely disappeared. It has been months now, and I am totally free! God is faithful!\u201D",
    date: "2026-08-02",
    author: {
      name: "Blessing Samuel",
      location: "Port Harcourt, Rivers State",
    },
  },
  {
    id: "delay-turned-to-property",
    category: "Breakthroughs",
    title: "Two Years Of Delay Turned Into Property By Favour",
    excerpt:
      "\u201CI joined this Commission on the first Sunday of 2026. For two years, I had been trusting God for a particular piece of land. Each time I raised the money to purchase it, an unexpected need would arise...\u201D",
    fullStory:
      "\u201CI joined this Commission on the first Sunday of 2026. For two years, I had been trusting God for a particular piece of land. Each time I raised the money to purchase it, an unexpected need would arise and consume the funds. After joining Arrow of Deliverance Ministries and partnering in faith, God opened a door of favour. Not only did I acquire the land, but the owner gave me a significant discount that I never expected. What the enemy delayed, God restored with interest. To God be the glory!\u201D",
    date: "2026-09-01",
    images: ["/grid-image/image-1.jpg", "/grid-image/image-2.jpg"],
    author: {
      name: "Emmanuel Wai",
      location: "Salvation Ministries, Egbalor Branch",
    },
  },
  {
    id: "delivered-from-addiction",
    category: "Deliverance",
    title: "10 Years of Addiction Destroyed",
    excerpt:
      "\u201CI struggled with severe addiction for over 10 years. It ruined my career and strained my relationship with my family. I had tried multiple rehab programs, but nothing seemed to work...\u201D",
    fullStory:
      "\u201CI struggled with severe addiction for over 10 years. It ruined my career and strained my relationship with my family. I had tried multiple rehab programs, but nothing seemed to work. A friend invited me to the Deliverance Service here. When the word was preached, I felt a heavy burden lift off my chest. When the altar call was made, I surrendered my life to Christ. Since that day, the urge to return to my old habits has completely vanished. My mind is restored, and my family has taken me back. Jesus saved my life!\u201D",
    date: "2026-08-20",
    author: {
      name: "Michael Peters",
      location: "Jalingo, Taraba State",
    },
  },
  {
    id: "miraculous-job-offer",
    category: "Provision",
    title: "Miraculous Job Offer After 3 Years of Unemployment",
    excerpt:
      "\u201CGraduating with honors, I expected to secure a job immediately. However, for three long years, I attended countless interviews with no success. I was depressed and nearly gave up hope...\u201D",
    fullStory:
      "\u201CGraduating with honors, I expected to secure a job immediately. However, for three long years, I attended countless interviews with no success. I was depressed and nearly gave up hope. I decided to dedicate myself fully to kingdom service in the church. During the Anointing Service in August, a prophetic word was released concerning supernatural employment. I claimed it. That same week, a multinational company I had applied to over a year ago called me for an interview. Not only did I get the job, but I was offered a higher position than what I applied for! Praise God!\u201D",
    date: "2026-08-25",
    images: ["/grid-image/image-3.jpg"],
    author: {
      name: "Sarah Johnson",
      location: "Lagos, Nigeria",
    },
  },
  {
    id: "family-salvation",
    category: "Salvation",
    title: "Entire Family Surrenders to Christ",
    excerpt:
      "\u201CFor years, I was the only believer in my family. I would pray continuously for my parents and siblings, but they were deeply rooted in their traditional beliefs and often mocked my faith...\u201D",
    fullStory:
      "\u201CFor years, I was the only believer in my family. I would pray continuously for my parents and siblings, but they were deeply rooted in their traditional beliefs and often mocked my faith. I sowed a seed for their salvation during the Kingdom Advancement Month. Miraculously, a month later, my father had a profound encounter in a dream that shook him. He called me and asked me to take him to church. That Sunday, my entire family—my parents and three siblings—all came and gave their lives to Christ! Our home is now a sanctuary of peace.\u201D",
    date: "2026-09-05",
    author: {
      name: "David Nwachukwu",
      location: "Enugu, Nigeria",
    },
  },
  {
    id: "healed-of-ulcer",
    category: "Healing",
    title: "Severe Peptic Ulcer Healed Instantly",
    excerpt:
      "\u201CI had been battling severe peptic ulcer for five years. I could not eat most of my favorite foods, and the midnight pains were unbearable. I practically lived on medication...\u201D",
    fullStory:
      "\u201CI had been battling severe peptic ulcer for five years. I could not eat most of my favorite foods, and the midnight pains were unbearable. I practically lived on medication. During the communion service, Pastor instructed us to take the communion as the medicine of life. I took it with deep faith, believing God for an end to the affliction. Since that day, I have eaten everything I previously couldn't, and I haven't experienced a single pain. I went to the doctor, and he confirmed the ulcers are healed!\u201D",
    date: "2026-09-10",
    author: {
      name: "Grace Olamide",
      location: "Abuja, FCT",
    },
  },
  {
    id: "business-breakthrough",
    category: "Breakthroughs",
    title: "From Debt to Multi-Million Naira Contracts",
    excerpt:
      "\u201CMy business was on the verge of bankruptcy. I was heavily in debt and creditors were threatening me daily. I attended the Business & Career Summit hosted by the church...\u201D",
    fullStory:
      "\u201CMy business was on the verge of bankruptcy. I was heavily in debt and creditors were threatening me daily. I attended the Business & Career Summit hosted by the church, where we were taught biblical principles of prosperity. I applied the teachings, prioritized my tithe, and trusted God. Within a month, I received a phone call for a contract that was completely out of my league. Not only did it clear all my debts, but it gave me enough capital to expand. My business is now thriving globally!\u201D",
    date: "2026-09-12",
    images: ["/grid-image/image-4.jpg"],
    author: {
      name: "Chukwudi Eze",
      location: "Port Harcourt",
    },
  },
  {
    id: "safe-delivery",
    category: "Healing",
    title: "Safe Delivery After Medical Complications",
    excerpt:
      "\u201CWhen I was 7 months pregnant, the doctors diagnosed a serious complication that threatened both my life and the baby's. They said I would need to have an emergency surgery...\u201D",
    fullStory:
      "\u201CWhen I was 7 months pregnant, the doctors diagnosed a serious complication that threatened both my life and the baby's. They said I would need to have an emergency surgery with a 50/50 chance of survival. We brought the medical report to the church and Pastor prayed over it, declaring that we would return with our baby alive and well. Against all medical predictions, the pregnancy stabilized. At full term, I delivered a healthy bouncing baby boy naturally, without any complications. God is the master healer!\u201D",
    date: "2026-09-14",
    images: ["/grid-image/image-5.jpg"],
    author: {
      name: "Mary & John Obi",
      location: "Jalingo, Taraba State",
    },
  },
  {
    id: "visa-approval",
    category: "Breakthroughs",
    title: "Miraculous Visa Approval After 4 Denials",
    excerpt:
      "\u201CI had been trying to travel for my master's degree but was denied a visa four times. I was devastated and decided to give up on my dream. Then I heard a testimony in church...\u201D",
    fullStory:
      "\u201CI had been trying to travel for my master's degree but was denied a visa four times. I was devastated and decided to give up on my dream. Then I heard a testimony in church of someone who received their visa miraculously. I tapped into that testimony and applied one last time. During the interview, the consular officer simply looked at my documents, asked me one question, and said 'Your visa is approved.' God completely turned my story around!\u201D",
    date: "2026-09-15",
    author: {
      name: "Tosin Adebayo",
      location: "Ibadan, Oyo State",
    },
  },
  {
    id: "supernatural-protection",
    category: "Deliverance",
    title: "Preserved from a Fatal Accident",
    excerpt:
      "\u201CI was traveling interstate when our vehicle's brake failed at high speed. The driver lost control, and the car somersaulted multiple times before crashing into a ravine...\u201D",
    fullStory:
      "\u201CI was traveling interstate when our vehicle's brake failed at high speed. The driver lost control, and the car somersaulted multiple times before crashing into a ravine. As the car was tumbling, I screamed the name of Jesus. When the dust settled, the car was completely totaled, but miraculously, I crawled out without a single scratch! People who gathered to help couldn't believe anyone survived that crash. God's hand of protection is truly upon my life.\u201D",
    date: "2026-09-16",
    author: {
      name: "Samuel Kalu",
      location: "Owerri, Imo State",
    },
  },
  {
    id: "scholarship-provision",
    category: "Provision",
    title: "Fully Funded International Scholarship",
    excerpt:
      "\u201CI desired to study abroad but coming from a humble background, I had absolutely no funds. I decided to trust God and started applying for scholarships while praying fervently...\u201D",
    fullStory:
      "\u201CI desired to study abroad but coming from a humble background, I had absolutely no funds. I decided to trust God and started applying for scholarships while praying fervently. I sowed my last savings towards the church building project. A few weeks later, I received an email from a top university in the UK. I had been awarded a fully-funded scholarship that covers my tuition, accommodation, and gives me a monthly stipend. God provided for me in a way I could never have imagined.\u201D",
    date: "2026-09-18",
    images: ["/grid-image/image-6.jpg"],
    author: {
      name: "Favour Bassey",
      location: "Calabar, Cross River State",
    },
  }
];
