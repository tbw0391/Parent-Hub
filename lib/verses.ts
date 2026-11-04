// Verse of the Day list, quoted from the ESV (credited on display).
// Everyone sees the same verse on a given day; the list cycles in order.

export type Verse = { ref: string; text: string };

export const VERSES: Verse[] = [
  { ref: 'Proverbs 22:6', text: 'Train up a child in the way he should go; even when he is old he will not depart from it.' },
  { ref: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.' },
  { ref: 'Philippians 4:6', text: 'Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.' },
  { ref: 'Psalm 127:3', text: 'Behold, children are a heritage from the LORD, the fruit of the womb a reward.' },
  { ref: 'Proverbs 3:5–6', text: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.' },
  { ref: 'Ephesians 6:4', text: 'Fathers, do not provoke your children to anger, but bring them up in the discipline and instruction of the Lord.' },
  { ref: 'Isaiah 40:31', text: 'But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.' },
  { ref: 'Deuteronomy 6:6–7', text: 'And these words that I command you today shall be on your heart. You shall teach them diligently to your children, and shall talk of them when you sit in your house, and when you walk by the way, and when you lie down, and when you rise.' },
  { ref: 'James 1:5', text: 'If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.' },
  { ref: 'Galatians 6:9', text: 'And let us not grow weary of doing good, for in due season we will reap, if we do not give up.' },
  { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.' },
  { ref: 'Lamentations 3:22–23', text: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.' },
  { ref: 'Matthew 11:28', text: 'Come to me, all who labor and are heavy laden, and I will give you rest.' },
  { ref: '3 John 1:4', text: 'I have no greater joy than to hear that my children are walking in the truth.' },
  { ref: 'Romans 8:28', text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.' },
  { ref: 'Psalm 118:24', text: 'This is the day that the LORD has made; let us rejoice and be glad in it.' },
  { ref: 'Colossians 3:21', text: 'Fathers, do not provoke your children, lest they become discouraged.' },
  { ref: '1 Thessalonians 5:16–18', text: 'Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.' },
  { ref: 'Isaiah 41:10', text: 'Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.' },
  { ref: 'Proverbs 15:1', text: 'A soft answer turns away wrath, but a harsh word stirs up anger.' },
  { ref: 'Matthew 6:34', text: 'Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself. Sufficient for the day is its own trouble.' },
  { ref: 'Psalm 103:13', text: 'As a father shows compassion to his children, so the LORD shows compassion to those who fear him.' },
  { ref: '1 Peter 5:7', text: 'Casting all your anxieties on him, because he cares for you.' },
  { ref: 'Ephesians 4:32', text: 'Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.' },
  { ref: 'Joshua 24:15', text: 'But as for me and my house, we will serve the LORD.' },
  { ref: 'Psalm 23:1', text: 'The LORD is my shepherd; I shall not want.' },
  { ref: 'James 1:19', text: 'Know this, my beloved brothers: let every person be quick to hear, slow to speak, slow to anger.' },
  { ref: 'Mark 10:14', text: 'Let the children come to me; do not hinder them, for to such belongs the kingdom of God.' },
  { ref: 'Romans 12:12', text: 'Rejoice in hope, be patient in tribulation, be constant in prayer.' },
  { ref: 'Psalm 119:105', text: 'Your word is a lamp to my feet and a light to my path.' },
  { ref: 'Isaiah 54:13', text: 'All your children shall be taught by the LORD, and great shall be the peace of your children.' },
  { ref: 'Colossians 3:23', text: 'Whatever you do, work heartily, as for the Lord and not for men.' },
  { ref: 'Micah 6:8', text: 'He has told you, O man, what is good; and what does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?' },
  { ref: 'Proverbs 14:26', text: 'In the fear of the LORD one has strong confidence, and his children will have a refuge.' },
  { ref: 'Zephaniah 3:17', text: 'The LORD your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love; he will exult over you with loud singing.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through him who strengthens me.' },
  { ref: 'Psalm 139:14', text: 'I praise you, for I am fearfully and wonderfully made. Wonderful are your works; my soul knows it very well.' },
  { ref: 'Galatians 5:22–23', text: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.' },
  { ref: 'Proverbs 16:3', text: 'Commit your work to the LORD, and your plans will be established.' },
  { ref: 'John 14:27', text: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.' },
  { ref: '2 Timothy 1:7', text: 'For God gave us a spirit not of fear but of power and love and self-control.' },
  { ref: 'Proverbs 17:6', text: 'Grandchildren are the crown of the aged, and the glory of children is their fathers.' },
  { ref: 'Psalm 37:5', text: 'Commit your way to the LORD; trust in him, and he will act.' },
  { ref: 'Matthew 5:16', text: 'In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.' },
  { ref: 'Isaiah 26:3', text: 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.' },
  { ref: '1 John 4:19', text: 'We love because he first loved us.' },
  { ref: 'Proverbs 31:25', text: 'Strength and dignity are her clothing, and she laughs at the time to come.' },
  { ref: 'Psalm 90:12', text: 'So teach us to number our days that we may get a heart of wisdom.' },
  { ref: '2 Corinthians 12:9', text: 'My grace is sufficient for you, for my power is made perfect in weakness.' },
  { ref: 'Nahum 1:7', text: 'The LORD is good, a stronghold in the day of trouble; he knows those who take refuge in him.' },
  { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.' },
  { ref: 'Psalm 121:1–2', text: 'I lift up my eyes to the hills. From where does my help come? My help comes from the LORD, who made heaven and earth.' },
  { ref: 'Colossians 3:14', text: 'And above all these put on love, which binds everything together in perfect harmony.' },
  { ref: 'Psalm 34:8', text: 'Oh, taste and see that the LORD is good! Blessed is the man who takes refuge in him!' },
  { ref: 'Hebrews 13:8', text: 'Jesus Christ is the same yesterday and today and forever.' },
  { ref: 'Psalm 16:11', text: 'You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore.' },
  { ref: '1 Corinthians 16:14', text: 'Let all that you do be done in love.' },
  { ref: 'Numbers 6:24–26', text: 'The LORD bless you and keep you; the LORD make his face to shine upon you and be gracious to you; the LORD lift up his countenance upon you and give you peace.' },
];

// Day number in Eastern time, so the verse changes at local midnight rather than UTC.
export function verseOfTheDay(now: Date = new Date()): Verse {
  const [y, m, d] = now
    .toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
    .split('-')
    .map(Number);
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return VERSES[day % VERSES.length];
}
