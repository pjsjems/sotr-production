// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SPY ON THE RISE â€” Site Logic v4
// Encoding: UTF-8
// Language system: bridges to Next.js body via window.__sotrSetLang
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SPY ON THE RISE â€” Complete Catalog Data
// Source: Prospectus May 2026 + Protocol v2
//
// HOW TO UPDATE:
//   - To add a book: copy an existing entry, give it a unique key
//   - To unlock a book: change available:false â†’ available:true
//   - To update a synopsis: edit the synopsis field
//   - To add retail URLs: add them to the details array or
//     use the Sanity CMS dashboard (no code required)
//
// LOCK SYSTEM:
//   available:true  = full presentation shown to readers
//   available:false = locked cover shown, release date displayed,
//                     newsletter signup prompt shown
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


const BOOKS = {
  // ── THE MERCER FILES (7 books) ──────────────────────
  mercer1:  { key:'mercer1',  color:'#1C2B4A', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: The Kremlin Coup', subtitle:'The Kremlin Coup',
    lang:'EN / FR', pages:'~340p', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 1', available:true, price:'From $15.99',
    image:'/covers/mercer1.jpg',
    synopsis_en:'The operation in Moscow was not supposed to produce a file. It was supposed to disappear. The Kremlin Coup opens the Mercer series with the assignment that taught operative Mercer the first institutional truth: every mission that goes wrong leaves something behind, and that something will eventually come looking for you. Book 1 establishes the intelligence architecture, the operational logic, and the moral geometry that the rest of the series will spend six books pulling apart.',
    synopsis_fr:'L\'opération à Moscou n\'était pas censée produire de dossier. Elle était censée disparaître. Le Coup du Kremlin ouvre la série Mercer avec la mission qui a appris à l\'agent Mercer la première vérité institutionnelle: toute mission qui tourne mal laisse quelque chose derrière elle, et ce quelque chose viendra éventuellement vous chercher. Le Livre 1 établit l\'architecture du renseignement, la logique opérationnelle, et la géométrie morale que le reste de la série passera six livres à démanteler.',
    synopsis_es:'La operación en Moscú no se suponía que debía producir un expediente. Se suponía que debía desaparecer. El Golpe del Kremlin abre la serie Mercer con la misión que le enseñó al agente Mercer la primera verdad institucional: toda misión que sale mal deja algo atrás, y ese algo eventualmente vendrá a buscarte. El Libro 1 establece la arquitectura de inteligencia, la lógica operacional, y la geometría moral que el resto de la serie pasará seis libros desmontando.',
    synopsis:'The operation in Moscow was not supposed to produce a file. It was supposed to disappear. The Kremlin Coup opens the Mercer series with the assignment that taught operative Mercer the first institutional truth: every mission that goes wrong leaves something behind, and that something will eventually come looking for you. Book 1 establishes the intelligence architecture, the operational logic, and the moral geometry that the rest of the series will spend six books pulling apart.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 1'],['Subtitle','The Kremlin Coup'],['Language','English & French'],['Pages','~340'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  mercer2:  { key:'mercer2',  color:'#1C2B4A', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: The Prague Protocol', subtitle:'The Prague Protocol',
    lang:'EN / FR', pages:'~360p', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 2', available:true, price:'From $15.99',
    synopsis:'Book 2 moves the series into the institutional corridors of Central European intelligence. The Prague Protocol maps the organizational architecture of betrayal: how loyalty is manufactured, tested, and systematically destroyed within intelligence structures that cannot admit the nature of what they ask of their operatives.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 2'],['Subtitle','The Prague Protocol'],['Language','English & French'],['Pages','~360'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  mercer3:  { key:'mercer3',  color:'#1C2B4A', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: The Beijing Residue', subtitle:'The Beijing Residue',
    lang:'EN / FR', pages:'~375p', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 3', available:true, price:'From $15.99',
    synopsis:'Book 3 takes Mercer into the most opaque theater of global intelligence: China\'s institutional memory and the residue it leaves in every operation that touches it. The Beijing Residue is the most architecturally complex volume of the early series, a novel about what intelligence agencies learn from their failures, and what they are constitutionally unable to learn.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 3'],['Subtitle','The Beijing Residue'],['Language','English & French'],['Pages','~375'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  mercer4:  { key:'mercer4',  color:'#162240', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: Book 4', subtitle:'The Zurich Legacy',
    lang:'EN / FR', pages:'~380p', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 4', available:true, price:'From $15.99', release:'2027',
    synopsis:'The Zurich Legacy: Book 4 of The Mercer Files. Full synopsis to be announced. Expected 2027.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 4'],['Subtitle','The Zurich Legacy'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  mercer5:  { key:'mercer5',  color:'#162240', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: Book 5', subtitle:'The Oslo Signal',
    lang:'EN / FR', pages:'~370p', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 5', available:true, price:'From $15.99', release:'2027',
    synopsis:'The Oslo Signal: Book 5 of The Mercer Files. Full synopsis to be announced. Expected 2027.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 5'],['Subtitle','The Oslo Signal'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  mercer6:  { key:'mercer6',  color:'#162240', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: Book 6', subtitle:'Book 6',
    lang:'EN / FR', pages:'TBD', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 6', available:true, price:'From $15.99', release:'2027',
    synopsis:'Book 6 of The Mercer Files. Full synopsis to be announced. Expected 2027.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 6'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  mercer7:  { key:'mercer7',  color:'#1C2B4A', orn:'◆', genre:'Spy Thriller',
    title:'The Mercer Files: The Last Architecture', subtitle:'The Last Architecture',
    lang:'EN / FR', pages:'~420p', series:'The Mercer Files',
    seriesKey:'mercer', vol:'Vol. 7', available:true, price:'From $15.99',
    synopsis_en:'Seven missions. Seven cities. One file that was never supposed to exist. The Last Architecture is the concluding volume of the Mercer Files series, and it answers the question the first six books have been carefully avoiding: what does an operative do when the institution that made him is the threat he cannot name? The answer is architectural. The last thing Mercer builds is not a case. It is an exit.',
    synopsis_fr:'Sept missions. Sept villes. Un dossier qui n\'était jamais censé exister. La Dernière Architecture est le volume conclusif de la série Mercer Files, et il répond à la question que les six premiers livres ont soigneusement évitée: que fait un agent lorsque l\'institution qui l\'a créé est la menace qu\'il ne peut pas nommer? La réponse est architecturale. La dernière chose que Mercer construit n\'est pas un dossier. C\'est une sortie.',
    synopsis_es:'Siete misiones. Siete ciudades. Un expediente que nunca debió existir. La Última Arquitectura es el volumen conclusivo de la serie Mercer Files, y responde la pregunta que los primeros seis libros han estado cuidadosamente evitando: ¿qué hace un agente cuando la institución que lo creó es la amenaza que no puede nombrar? La respuesta es arquitectónica. Lo último que Mercer construye no es un expediente. Es una salida.',
    synopsis:'Seven missions. Seven cities. One file that was never supposed to exist. The Last Architecture is the concluding volume of the Mercer Files series, and it answers the question the first six books have been carefully avoiding: what does an operative do when the institution that made him is the threat he cannot name? The answer is architectural. The last thing Mercer builds is not a case. It is an exit.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Spy Thriller · Fiction'],['Series','The Mercer Files · Book 7'],['Subtitle','The Last Architecture'],['Language','English & French'],['Pages','~420'],['Format','Print · eBook · Audiobook'],['Publisher','SPY ON THE RISE']] },

  // ── ANATOMY OF MICRO-SOCIETIES (8 volumes) ──────────
  anatomy1: { key:'anatomy1', color:'#2C1A0A', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: The Nave of Ambitions', subtitle:'Anatomy of a Congregation',
    lang:'EN / FR', pages:'~290p', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 1', available:true, price:'From $15.99',
    synopsis_en:'Every congregation has a god it worships out loud. It also has one it worships in silence. The Nave of Ambitions enters the religious micro-society and reads the behavioral architecture underneath the liturgy. Who rises, who is tolerated, who is slowly expelled, and by what invisible mechanisms. This is not a book about faith. It is a book about what people do with each other when they believe they are doing something sacred.',
    synopsis_fr:'Toute congrégation a un dieu qu\'elle vénère à voix haute. Elle en a également un qu\'elle vénère en silence. La Nef des Ambitions pénètre dans la micro-société religieuse pour en lire l\'architecture comportementale sous la liturgie. Qui monte, qui est toléré, qui est lentement exclu, et par quels mécanismes invisibles. Ce n\'est pas un livre sur la foi. C\'est un livre sur ce que les gens se font les uns aux autres lorsqu\'ils croient accomplir quelque chose de sacré.',
    synopsis_es:'Toda congregación tiene un dios que venera en voz alta. También tiene uno que venera en silencio. La Nave de las Ambiciones entra en la micro-sociedad religiosa y lee la arquitectura conductual que subyace bajo la liturgia. Quién asciende, quién es tolerado, quién es lentamente expulsado, y por qué mecanismos invisibles. Este no es un libro sobre la fe. Es un libro sobre lo que las personas se hacen entre sí cuando creen que están haciendo algo sagrado.',
    synopsis:'Every congregation has a god it worships out loud. It also has one it worships in silence. The Nave of Ambitions enters the religious micro-society and reads the behavioral architecture underneath the liturgy. Who rises, who is tolerated, who is slowly expelled, and by what invisible mechanisms. This is not a book about faith. It is a book about what people do with each other when they believe they are doing something sacred.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 1'],['Subtitle','The Nave of Ambitions'],['Language','English & French'],['Chapters','11'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  anatomy2: { key:'anatomy2', color:'#2C1A0A', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: The Open-Space of Predators', subtitle:'Anatomy of a Corporation',
    lang:'EN / FR', pages:'~310p', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 2', available:true, price:'From $15.99',
    synopsis_en:'The open-space office was invented to promote collaboration. What it actually created was a new form of predatory social organization with no walls to hide behind. The Open-Space of Predators maps the behavioral ecology of the modern workplace: territorial markings, dominance displays, the politics of visibility, and the unwritten laws that determine who thrives and who quietly disappears. Every law in this book is one you have already lived. You simply did not have a name for it.',
    synopsis_fr:'L\'open-space a été inventé pour favoriser la collaboration. Ce qu\'il a réellement créé, c\'est une nouvelle forme d\'organisation sociale prédatrice, sans murs pour se cacher. L\'Open-Space des Fauves cartographie l\'écologie comportementale du lieu de travail moderne: les marquages territoriaux, les démonstrations de dominance, la politique de la visibilité, et les lois non écrites qui déterminent qui prospère et qui disparaît silencieusement. Chaque loi de ce livre, vous l\'avez déjà vécue. Vous n\'aviez simplement pas de nom pour elle.',
    synopsis_es:'El espacio de trabajo abierto fue inventado para promover la colaboración. Lo que realmente creó fue una nueva forma de organización social predatoria sin paredes detrás de las cuales esconderse. El Open-Space de los Depredadores mapea la ecología conductual del lugar de trabajo moderno: marcaciones territoriales, demostraciones de dominancia, la política de la visibilidad, y las leyes no escritas que determinan quién prospera y quién desaparece silenciosamente. Cada ley de este libro es una que ya has vivido. Simplemente no tenías un nombre para ella.',
    synopsis:'The open-space office was invented to promote collaboration. What it actually created was a new form of predatory social organization with no walls to hide behind. The Open-Space of Predators maps the behavioral ecology of the modern workplace: territorial markings, dominance displays, the politics of visibility, and the unwritten laws that determine who thrives and who quietly disappears. Every law in this book is one you have already lived. You simply did not have a name for it.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 2'],['Subtitle','The Open-Space of Predators'],['Language','English & French'],['Chapters','11'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  anatomy3: { key:'anatomy3', color:'#2C1A0A', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: The Virtual Tribes', subtitle:'The Sovereignty of Shadows and the Mechanics of Pack Justice',
    lang:'EN / FR', pages:'~280p', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 3', available:true, price:'From $15.99',
    synopsis_en:'Online communities look like they have no rules. They are in fact some of the most rule-governed societies ever created. The Virtual Tribes enters the world of digital packs: the forums, the fandoms, the comment sections that function as courts of law. It maps who holds authority without a title, how dissent is punished without a judge, and what the pack does when it decides someone no longer belongs. The sovereignty here is invisible. The consequences are not.',
    synopsis_fr:'Les communautés en ligne donnent l\'impression de n\'avoir aucune règle. Ce sont en réalité quelques-unes des sociétés les plus normées jamais créées. Les Tribus du Virtuel entre dans le monde des meutes numériques: les forums, les fandoms, les sections de commentaires qui fonctionnent comme des tribunaux. Il cartographie qui détient l\'autorité sans titre, comment la dissidence est punie sans juge, et ce que la meute fait lorsqu\'elle décide que quelqu\'un n\'appartient plus au groupe. La souveraineté ici est invisible. Les conséquences ne le sont pas.',
    synopsis_es:'Las comunidades en línea parecen no tener reglas. Son de hecho algunas de las sociedades más reguladas jamás creadas. Las Tribus Virtuales entra en el mundo de las manadas digitales: los foros, los fandoms, las secciones de comentarios que funcionan como tribunales. Mapea quién tiene autoridad sin título, cómo se castiga la disidencia sin juez, y qué hace la manada cuando decide que alguien ya no pertenece. La soberanía aquí es invisible. Las consecuencias no.',
    synopsis:'Online communities look like they have no rules. They are in fact some of the most rule-governed societies ever created. The Virtual Tribes enters the world of digital packs: the forums, the fandoms, the comment sections that function as courts of law. It maps who holds authority without a title, how dissent is punished without a judge, and what the pack does when it decides someone no longer belongs. The sovereignty here is invisible. The consequences are not.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 3'],['Subtitle','The Virtual Tribes'],['Language','English & French'],['Chapters','6'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  anatomy4: { key:'anatomy4', color:'#3A2010', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: The Locker Room of Identities', subtitle:'Anatomy of a Sports Team',
    lang:'EN / FR', pages:'~300p', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 4', available:true, price:'From $15.99',
    synopsis_en:'The locker room is the last space where performance has not yet been packaged for public consumption. What happens in it (the hazing and the loyalty, the humor that tests and the silence that judges) is the raw behavioral material of group identity before it gets edited into something acceptable. The Locker Room of Identities reads a sports team as a society: how masculinity is negotiated in real time, how belonging is earned and revoked, and what the iron law of the changing room actually is.',
    synopsis_fr:'Le vestiaire est le dernier espace où la performance n\'a pas encore été emballée pour la consommation publique. Ce qui s\'y passe (le bizutage et la loyauté, l\'humour qui teste et le silence qui juge) est le matériau comportemental brut de l\'identité de groupe avant qu\'il ne soit édité pour devenir quelque chose d\'acceptable. Le Vestiaire des Identités lit une équipe sportive comme une société: comment la masculinité est négociée en temps réel, comment l\'appartenance est gagnée et révoquée, et quelle est la loi fondamentale du vestiaire.',
    synopsis_es:'El vestuario es el último espacio donde el rendimiento aún no ha sido empaquetado para el consumo público. Lo que sucede en él, el acoso y la lealtad, el humor que prueba y el silencio que juzga, es el material conductual en bruto de la identidad grupal antes de que se edite en algo aceptable. El Vestuario de las Identidades lee un equipo deportivo como una sociedad: cómo se negocia la masculinidad en tiempo real, cómo se gana y se revoca la pertenencia, y cuál es la ley fundamental del vestuario.',
    synopsis:'The locker room is the last space where performance has not yet been packaged for public consumption. What happens in it (the hazing and the loyalty, the humor that tests and the silence that judges) is the raw behavioral material of group identity before it gets edited into something acceptable. The Locker Room of Identities reads a sports team as a society: how masculinity is negotiated in real time, how belonging is earned and revoked, and what the iron law of the changing room actually is.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 4'],['Subtitle','The Locker Room of Identities'],['Language','English & French'],['Chapters','7'],['Publisher','SPY ON THE RISE']] },

  anatomy5: { key:'anatomy5', color:'#3A2010', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: The Sovereignty of the Threshold', subtitle:'Anatomy of a Co-Ownership',
    lang:'EN / FR', pages:'TBD', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 5', available:true, price:'From $15.99',
    synopsis_en:'A co-ownership is technically a legal arrangement between property owners. Functionally, it is one of the most conflict-dense micro-societies in civilian life. The Sovereignty of the Threshold reads the co-ownership building as a political system: general assemblies that are really power struggles, rules that are selectively enforced, neighbors who have negotiated an entire geopolitics across a shared staircase. Every building has a sovereign. Finding out who it really is tends to be the first surprise.',
    synopsis_fr:'Une copropriété est techniquement un arrangement juridique entre propriétaires. Fonctionnellement, c\'est l\'une des micro-sociétés les plus denses en conflits de la vie civile. La Souveraineté du Seuil lit l\'immeuble en copropriété comme un système politique: des assemblées générales qui sont en réalité des luttes de pouvoir, des règles appliquées de manière sélective, des voisins qui ont négocié une géopolitique entière à travers une cage d\'escalier partagée. Chaque immeuble a un souverain. Découvrir qui il est vraiment est généralement la première surprise.',
    synopsis_es:'Una copropiedad es técnicamente un acuerdo legal entre propietarios. Funcionalmente, es una de las micro-sociedades más cargadas de conflictos en la vida civil. La Soberanía del Umbral lee el edificio en régimen de copropiedad como un sistema político: asambleas generales que son en realidad luchas de poder, normas que se aplican de forma selectiva, vecinos que han negociado toda una geopolítica a través de una escalera común. Cada edificio tiene un soberano. Descubrir quién es realmente suele ser la primera sorpresa.',
    synopsis:'A co-ownership is technically a legal arrangement between property owners. Functionally, it is one of the most conflict-dense micro-societies in civilian life. The Sovereignty of the Threshold reads the co-ownership building as a political system: general assemblies that are really power struggles, rules that are selectively enforced, neighbors who have negotiated an entire geopolitics across a shared staircase. Every building has a sovereign. Finding out who it really is tends to be the first surprise.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 5'],['Subtitle','The Sovereignty of the Threshold'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  anatomy6: { key:'anatomy6', color:'#3A2010', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: The Game of Us', subtitle:'[Subtitle to be confirmed]',
    lang:'EN / FR', pages:'TBD', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 6', available:false, price:'Coming 2027', release:'2027',
    synopsis:'Anatomy of Micro-Societies, Vol. 6: Le Jeu de Nous (The Game of Us). Full synopsis to be announced. Expected 2027.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 6'],['Subtitle','The Game of Us'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  anatomy7: { key:'anatomy7', color:'#3A2010', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: Influence System Human Experience', subtitle:'[Subtitle to be confirmed]',
    lang:'EN / FR', pages:'TBD', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 7', available:false, price:'Coming 2028', release:'2027',
    synopsis:'Anatomy of Micro-Societies, Vol. 7: Influence System Human Experience. Full synopsis to be announced. Expected 2028.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 7'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  anatomy8: { key:'anatomy8', color:'#3A2010', orn:'◆', genre:'Behavioral Sociology',
    title:'Anatomy of Micro-Societies: Where Our Bonds Transform Us', subtitle:'[Subtitle to be confirmed]',
    lang:'EN / FR', pages:'TBD', series:'Anatomy of Micro-Societies',
    seriesKey:'anatomy', vol:'Vol. 8', available:false, price:'Coming 2027', release:'2027',
    synopsis:'Anatomy of Micro-Societies, Vol. 8: Où Nos Liens Nous Transforment (Where Our Bonds Transform Us). Full synopsis to be announced. Expected 2027.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Behavioral Sociology · Essay'],['Series','Anatomy of Micro-Societies · Vol. 8'],['Subtitle','Where Our Bonds Transform Us'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  // ── THE CROOKED CROSS CHRONICLES (5 books) ──────────
  crooked1: { key:'crooked1', color:'#0D1A10', orn:'◆', genre:'Historical Fiction',
    title:'The Crooked Cross Chronicles: A Murder in the Bunker', subtitle:'Book 1',
    lang:'EN / FR', pages:'~380p', series:'The Crooked Cross Chronicles',
    seriesKey:'crooked', vol:'Book 1', available:true, price:'From $15.99',
    synopsis_en:'The body was found in the bunker on a Tuesday. By Wednesday, the paperwork had already decided it was not a murder. A Murder in the Bunker opens the Crooked Cross Chronicles at the moment when wartime authority becomes so total that crime itself requires institutional permission. This is historical fiction about what happens to conscience when the system that should punish the wrong is the same system that committed it.',
    synopsis_fr:'Le corps a été trouvé dans le bunker un mardi. Le mercredi, les papiers avaient déjà décidé que ce n\'était pas un meurtre. Un Meurtre dans le Bunker ouvre les Chroniques de la Croix Tordue au moment où l\'autorité en temps de guerre devient si totale que le crime lui-même nécessite une autorisation institutionnelle. C\'est de la fiction historique sur ce qui arrive à la conscience quand le système qui devrait punir l\'injustice est le même système qui l\'a commise.',
    synopsis_es:'El cuerpo fue encontrado en el búnker un martes. El miércoles, el papeleo ya había decidido que no era un asesinato. Un Asesinato en el Búnker abre las Crónicas de la Cruz Torcida en el momento en que la autoridad en tiempos de guerra se vuelve tan total que el crimen mismo requiere permiso institucional. Es ficción histórica sobre lo que le sucede a la conciencia cuando el sistema que debería castigar el error es el mismo sistema que lo cometió.',
    synopsis:'The body was found in the bunker on a Tuesday. By Wednesday, the paperwork had already decided it was not a murder. A Murder in the Bunker opens the Crooked Cross Chronicles at the moment when wartime authority becomes so total that crime itself requires institutional permission. This is historical fiction about what happens to conscience when the system that should punish the wrong is the same system that committed it.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Historical Fiction · WWII'],['Series','The Crooked Cross Chronicles · Book 1'],['Subtitle','Murder in the Bunker'],['Language','English & French'],['Chapters','Prologue + 23 chapters + Epilogue'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  crooked2: { key:'crooked2', color:'#0D1A10', orn:'◆', genre:'Historical Fiction',
    title:'The Crooked Cross Chronicles: The Shadow Performer', subtitle:'Book 2',
    lang:'EN / FR', pages:'~350p', series:'The Crooked Cross Chronicles',
    seriesKey:'crooked', vol:'Book 2', available:true, price:'From $15.99', release:'2027',
    synopsis_en:'She performed for the occupiers because the alternative was worse. Or that is what she told herself. The Shadow Performer follows a stage artist navigating the occupied city, where every performance is both survival and collaboration, and the line between the two has been deliberately erased. Book 2 of the Crooked Cross Chronicles asks what art owes to history when history has decided to attend every rehearsal.',
    synopsis_fr:'Elle a joué pour les occupants parce que l\'alternative était pire. Ou c\'est ce qu\'elle s\'est dit. La Performeuse de l\'Ombre suit une artiste de scène naviguant dans la ville occupée, où chaque représentation est à la fois survie et collaboration, et la ligne entre les deux a été délibérément effacée. Le Livre 2 des Chroniques de la Croix Tordue demande ce que l\'art doit à l\'histoire quand l\'histoire a décidé d\'assister à chaque répétition.',
    synopsis_es:'Ella actuó para los ocupantes porque la alternativa era peor. O eso es lo que se dijo a sí misma. La Intérprete en la Sombra sigue a una artista escénica navegando la ciudad ocupada, donde cada actuación es a la vez supervivencia y colaboración, y la línea entre ambas ha sido deliberadamente borrada. El Libro 2 de las Crónicas de la Cruz Torcida pregunta qué le debe el arte a la historia cuando la historia ha decidido asistir a cada ensayo.',
    synopsis:'She performed for the occupiers because the alternative was worse. Or that is what she told herself. The Shadow Performer follows a stage artist navigating the occupied city, where every performance is both survival and collaboration, and the line between the two has been deliberately erased. Book 2 of the Crooked Cross Chronicles asks what art owes to history when history has decided to attend every rehearsal.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Historical Fiction · WWII'],['Series','The Crooked Cross Chronicles · Book 2'],['Subtitle','The Shadow Performer'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  crooked3: { key:'crooked3', color:'#0D1A10', orn:'◆', genre:'Historical Fiction',
    title:"The Crooked Cross Chronicles: The Orderly's Ledger", subtitle:'Book 3',
    lang:'EN / FR', pages:'TBD', series:'The Crooked Cross Chronicles',
    seriesKey:'crooked', vol:'Book 3', available:false, price:'Coming 2028', release:'2028',
    synopsis:"The Orderly's Ledger: Book 3 of The Crooked Cross Chronicles (Le Registre de l'Infirmier). Full synopsis to be announced. Expected 2028.",
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Historical Fiction · WWII'],['Series','The Crooked Cross Chronicles · Book 3'],["Subtitle","The Orderly's Ledger"],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  crooked4: { key:'crooked4', color:'#0D1A10', orn:'◆', genre:'Historical Fiction',
    title:'The Crooked Cross Chronicles: Book 4', subtitle:'Book 4: The Librarian of Geneva',
    lang:'EN / FR', pages:'TBD', series:'The Crooked Cross Chronicles',
    seriesKey:'crooked', vol:'Book 4', available:false, price:'Coming 2028', release:'2028',
    synopsis:'The Librarian of Geneva: Book 4 of The Crooked Cross Chronicles (Le Bibliothécaire de Genève). Full synopsis to be announced. Expected 2028.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Historical Fiction · WWII'],['Series','The Crooked Cross Chronicles · Book 4'],['Subtitle','The Librarian of Geneva'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  crooked5: { key:'crooked5', color:'#0D1A10', orn:'◆', genre:'Historical Fiction',
    title:'The Crooked Cross Chronicles: Book 5', subtitle:'Book 5: The Last Myth',
    lang:'EN / FR', pages:'TBD', series:'The Crooked Cross Chronicles',
    seriesKey:'crooked', vol:'Book 5', available:false, price:'Coming 2028', release:'2028',
    synopsis:'The Last Myth: Book 5 of The Crooked Cross Chronicles (Le Dernier Mythe). Full synopsis to be announced. Expected 2028.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Historical Fiction · WWII'],['Series','The Crooked Cross Chronicles · Book 5'],['Subtitle','The Last Myth'],['Language','English & French'],['Publisher','SPY ON THE RISE']] },

  // ── GEOPOLITICAL ESSAYS & IR THEORY WORKS ───────────
  chess:    { key:'chess',    color:'#0A1A2C', orn:'◆', genre:'Geopolitical Theory',
    title:'The Chess-Go Game', subtitle:'Hybrid Board Theory of Global Power',
    lang:'EN / FR', pages:'~380p', series:'IR Theory Works',
    seriesKey:'ir', vol:null, available:true, price:'From $18.99',
    synopsis_en:'Chess is a game of capture. Go is a game of encirclement. The two logics produce different kinds of power, different definitions of victory, and different relationships to time. The Chess-Go Game argues that contemporary geopolitics cannot be understood by either logic alone because the major powers are not playing the same game. The United States plays Chess. China plays Go. And the board they are playing on belongs to neither of them. This book maps the board.',
    synopsis_fr:'Les Échecs sont un jeu de capture. Le Go est un jeu d\'encerclement. Les deux logiques produisent des types de pouvoir différents, des définitions de la victoire différentes, et des rapports au temps différents. Le Jeu Échecs-Go soutient que la géopolitique contemporaine ne peut être comprise par l\'une ou l\'autre logique seule, car les grandes puissances ne jouent pas le même jeu. Les États-Unis jouent aux Échecs. La Chine joue au Go. Et l\'échiquier sur lequel ils jouent n\'appartient à aucun d\'eux. Ce livre cartographie l\'échiquier.',
    synopsis_es:'El Ajedrez es un juego de captura. El Go es un juego de cercamiento. Las dos lógicas producen tipos de poder diferentes, definiciones de victoria diferentes, y relaciones con el tiempo diferentes. El Juego Ajedrez-Go argumenta que la geopolítica contemporánea no puede entenderse con ninguna de las dos lógicas por sí sola, porque las grandes potencias no están jugando el mismo juego. Los Estados Unidos juegan al Ajedrez. China juega al Go. Y el tablero en el que están jugando no pertenece a ninguno de ellos. Este libro mapea el tablero.',
    synopsis:'Chess is a game of capture. Go is a game of encirclement. The two logics produce different kinds of power, different definitions of victory, and different relationships to time. The Chess-Go Game argues that contemporary geopolitics cannot be understood by either logic alone because the major powers are not playing the same game. The United States plays Chess. China plays Go. And the board they are playing on belongs to neither of them. This book maps the board.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Geopolitical IR Theory · Nonfiction'],['Series','IR Theory Works'],['Language','English & French'],['Pages','~380'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  chokepoints:{ key:'chokepoints', color:'#0F1C2A', orn:'◆', genre:'Geopolitical Theory',
    title:'La Civilisation des Flux: Chokepoints', subtitle:'Maritime Chokepoints: Tome I of VI',
    lang:'EN / FR', pages:'~350p', series:'IR Theory Works',
    seriesKey:'ir', vol:null, available:false, price:'From $17.99', release:'2026',
    synopsis:'Chokepoints maps the critical resource corridors and maritime passages that determine global power. A geopolitical anatomy of the world\'s most contested straits, canals, and transit routes, along with the states, alliances, and conflicts organized around their control. Cover brief complete; body chapters in final production.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Geopolitical Essay · Nonfiction'],['Series','IR Theory Works'],['Language','English & French'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  evaporating:{ key:'evaporating', color:'#0F1C2A', orn:'◆', genre:'Geopolitical Theory',
    title:'The Evaporating Empire', subtitle:"L'Empire d'Évaporation",
    lang:'EN / FR', pages:'~360p', series:'IR Theory Works',
    seriesKey:'ir', vol:null, available:true, price:'From $18.99',
    synopsis_en:'Empires do not collapse. They evaporate. The Evaporating Empire tracks American hegemony not through its military failures or its electoral crises but through the quieter, more consequential erosion of institutional credibility across the domains that actually sustain global order: trade law, monetary systems, alliance architecture, multilateral agreements. By the time the decline becomes visible, most of the water has already gone. This essay reads the steam.',
    synopsis_fr:'Les empires ne s\'effondrent pas. Ils s\'évaporent. L\'Empire d\'Évaporation suit l\'hégémonie américaine non pas à travers ses échecs militaires ou ses crises électorales, mais à travers l\'érosion plus silencieuse et plus conséquente de la crédibilité institutionnelle dans les domaines qui soutiennent réellement l\'ordre mondial: droit commercial, systèmes monétaires, architecture des alliances, accords multilatéraux. Au moment où le déclin devient visible, la majeure partie de l\'eau s\'est déjà évaporée. Cet essai lit la vapeur.',
    synopsis_es:'Los imperios no colapsan. Se evaporan. El Imperio de la Evaporación rastrea la hegemonía estadounidense no a través de sus fracasos militares o sus crisis electorales, sino a través de la erosión más silenciosa y consecuente de la credibilidad institucional en los dominios que realmente sostienen el orden global: derecho comercial, sistemas monetarios, arquitectura de alianzas, acuerdos multilaterales. Para cuando el declive se vuelve visible, la mayor parte del agua ya se ha ido. Este ensayo lee el vapor.',
    synopsis:'Empires do not collapse. They evaporate. The Evaporating Empire tracks American hegemony not through its military failures or its electoral crises but through the quieter, more consequential erosion of institutional credibility across the domains that actually sustain global order: trade law, monetary systems, alliance architecture, multilateral agreements. By the time the decline becomes visible, most of the water has already gone. This essay reads the steam.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Geopolitical Essay · Nonfiction'],['Series','IR Theory Works'],['Language','English & French'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  seatrial:   { key:'seatrial', color:'#0F1C2A', orn:'◆', genre:'Geopolitical Theory',
    title:'The Sea on Trial', subtitle:'Maritime Law and State Normative Piracy',
    lang:'EN / FR', pages:'~320p', series:'IR Theory Works',
    seriesKey:'ir', vol:null, available:false, price:'From $16.99', release:'2026',
    synopsis:'The Sea on Trial places maritime international law in the dock. Examining contested water sovereignty from the South China Sea to the Arctic, this volume maps the institutional and legal mechanisms through which states assert and contest dominion over the world\'s most strategic resource.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Maritime Law · Geopolitics'],['Series','IR Theory Works'],['Language','English & French'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  warorbits:  { key:'warorbits', color:'#0A0A2C', orn:'◆', genre:'Geopolitical Theory',
    title:'The War of Orbits', subtitle:'EN edition complete; FR pending',
    lang:'EN / FR', pages:'~340p', series:'IR Theory Works',
    seriesKey:'ir', vol:null, available:false, price:'From $17.99', release:'2026',
    synopsis_en:'The next war will not be fought on the ground. It will be fought over the ground, in the band of low-earth orbit where the satellite constellations that power every modern military now live. The War of Orbits maps the emerging theater of orbital geopolitics: the strategic competition for positioning, the vulnerabilities of space-based infrastructure, and the question that no treaty has yet answered: who owns the sky above a sovereign state? The rules of this war are being written now. This book reads the first draft.',
    synopsis_fr:'La prochaine guerre ne se combattra pas au sol. Elle se combattra au-dessus du sol, dans la bande d\'orbite basse où vivent désormais les constellations de satellites qui alimentent chaque armée moderne. La Guerre des Orbites cartographie le théâtre émergent de la géopolitique orbitale: la compétition stratégique pour le positionnement, les vulnérabilités des infrastructures spatiales, et la question qu\'aucun traité n\'a encore répondue: qui possède le ciel au-dessus d\'un État souverain? Les règles de cette guerre s\'écrivent maintenant. Ce livre lit le premier brouillon.',
    synopsis_es:'La próxima guerra no se librará en tierra. Se librará sobre la tierra, en la banda de órbita baja donde viven ahora las constelaciones de satélites que alimentan cada ejército moderno. La Guerra de las Órbitas mapea el teatro emergente de la geopolítica orbital: la competencia estratégica por el posicionamiento, las vulnerabilidades de la infraestructura espacial, y la pregunta que ningún tratado ha respondido aún: ¿quién posee el cielo sobre un estado soberano? Las reglas de esta guerra se están escribiendo ahora. Este libro lee el primer borrador.',
    synopsis:'The next war will not be fought on the ground. It will be fought over the ground, in the band of low-earth orbit where the satellite constellations that power every modern military now live. The War of Orbits maps the emerging theater of orbital geopolitics: the strategic competition for positioning, the vulnerabilities of space-based infrastructure, and the question that no treaty has yet answered: who owns the sky above a sovereign state? The rules of this war are being written now. This book reads the first draft.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Geopolitical Theory · Nonfiction'],['Series','IR Theory Works'],['Language','English & French'],['Status','Reader Review Stage'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  iran:       { key:'iran',     color:'#1A0A0A', orn:'◆', genre:'Geopolitical Theory',
    title:'Iran: The Laboratory', subtitle:'How One Nation Tested Every Political System',
    lang:'EN / FR', pages:'~360p', series:'IR Theory Works',
    seriesKey:'ir', vol:null, available:true, price:'From $18.99',
    synopsis_en:'No country in the modern world has run as many political experiments on its own population as Iran. Theocracy, revolution, sanctions, proxy war, nuclear negotiation, mass protest: the Islamic Republic has tested more systems of control, resistance, and legitimacy than any political science textbook would dare to cover in a single chapter. Iran: The Laboratory is a geopolitical essay that reads Iran not as a problem to be solved but as a lesson that has been running for forty-five years. The results are in. This book reads them.',
    synopsis_fr:'Aucun pays du monde moderne n\'a mené autant d\'expériences politiques sur sa propre population que l\'Iran. Théocratie, révolution, sanctions, guerre par procuration, négociation nucléaire, protestations de masse: la République islamique a testé plus de systèmes de contrôle, de résistance et de légitimité qu\'aucun manuel de science politique n\'oserait couvrir en un seul chapitre. L\'Iran: Le Laboratoire est un essai géopolitique qui lit l\'Iran non comme un problème à résoudre mais comme une leçon qui se déroule depuis quarante-cinq ans. Les résultats sont là. Ce livre les interprète.',
    synopsis_es:'Ningún país del mundo moderno ha realizado tantos experimentos políticos sobre su propia población como Irán. Teocracia, revolución, sanciones, guerra por delegación, negociación nuclear, protestas masivas: la República Islámica ha probado más sistemas de control, resistencia y legitimidad que cualquier libro de texto de ciencia política se atrevería a cubrir en un solo capítulo. Irán: El Laboratorio es un ensayo geopolítico que lee a Irán no como un problema a resolver sino como una lección que lleva cuarenta y cinco años en curso. Los resultados están disponibles. Este libro los lee.',
    synopsis:'No country in the modern world has run as many political experiments on its own population as Iran. Theocracy, revolution, sanctions, proxy war, nuclear negotiation, mass protest: the Islamic Republic has tested more systems of control, resistance, and legitimacy than any political science textbook would dare to cover in a single chapter. Iran: The Laboratory is a geopolitical essay that reads Iran not as a problem to be solved but as a lesson that has been running for forty-five years. The results are in. This book reads them.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Geopolitical Essay · Nonfiction'],['Series','IR Theory Works'],['Language','English & French'],['Status','Publication-Ready'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  // ── STANDALONE FICTION & ESSAYS ─────────────────────
  atlas:    { key:'atlas',    color:'#2C0A1A', orn:'◆', genre:'Bilingual Poetry',
    title:'Atlas of the Unspoken', subtitle:"Atlas de l'Inexprimé",
    lang:'EN / FR', pages:'~180p', series:'Poetry',
    seriesKey:'poetry', vol:null, available:true, price:'From $14.99',
    synopsis_en:'The Unspoken is not silence. It is everything that language approaches and then decides not to say. Atlas of the Unspoken is a collection of lyric poems that map these territories: the things said in the wrong room, the feelings that arrived too late for the conversation, the distances between people who share a language but not a meaning. The English and French editions are two separate books written in the same subject matter. Reading both is not reading a translation. It is reading two poets who arrived at the same silence by different roads.',
    synopsis_fr:'L\'Inexprimé n\'est pas le silence. C\'est tout ce que le langage approche et décide ensuite de ne pas dire. L\'Atlas de l\'Inexprimé est un recueil de poèmes lyriques qui cartographient ces territoires: les choses dites dans la mauvaise pièce, les sentiments arrivés trop tard pour la conversation, les distances entre des personnes qui partagent une langue mais pas un sens. Les éditions anglaise et française sont deux livres séparés écrits sur le même sujet. Les lire tous les deux n\'est pas lire une traduction. C\'est lire deux poètes qui sont arrivés au même silence par des chemins différents.',
    synopsis_es:'Lo Inexpresado no es el silencio. Es todo lo que el lenguaje se acerca y luego decide no decir. El Atlas de lo Inexpresado es una colección de poemas líricos que mapean estos territorios: las cosas dichas en el cuarto equivocado, los sentimientos que llegaron tarde para la conversación, las distancias entre personas que comparten un idioma pero no un significado. Las ediciones en inglés y francés son dos libros separados escritos sobre el mismo tema. Leerlos a ambos no es leer una traducción. Es leer dos poetas que llegaron al mismo silencio por caminos diferentes.',
    synopsis:'The Unspoken is not silence. It is everything that language approaches and then decides not to say. Atlas of the Unspoken is a collection of lyric poems that map these territories: the things said in the wrong room, the feelings that arrived too late for the conversation, the distances between people who share a language but not a meaning. The English and French editions are two separate books written in the same subject matter. Reading both is not reading a translation. It is reading two poets who arrived at the same silence by different roads.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Poetry · Bilingual'],['Language','English & French (parallel editions)'],['Pages','~180 per edition'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  teacher:  { key:'teacher',  color:'#1A1206', orn:'✦', genre:'Literary Fiction',
    title:"The Teacher's Gun", subtitle:'Le Fusil du Professeur',
    lang:'EN / FR', pages:'~290p', series:'Standalone',
    seriesKey:null, vol:null, available:true, price:'From $15.99',
    synopsis_en:'He did not plan to bring the gun to school. He planned to bring it home. That distinction, and what it costs him to maintain it, is the engine of The Teacher\'s Gun. A literary novel about a man who has spent his career teaching others to think clearly and finds himself, at a precise and undramatic moment, no longer able to. Fifteen chapters. No heroes. The kind of institutional violence that leaves no visible mark.',
    synopsis_fr:'Il n\'avait pas l\'intention d\'apporter l\'arme à l\'école. Il avait l\'intention de la rapporter chez lui. Cette distinction, et ce qu\'il lui en coûte de la maintenir, est le moteur du Fusil du Professeur. Un roman littéraire sur un homme qui a passé sa carrière à apprendre aux autres à penser clairement et qui se retrouve, à un moment précis et sans dramatisme, incapable de le faire lui-même. Quinze chapitres. Pas de héros. Le type de violence institutionnelle qui ne laisse aucune marque visible.',
    synopsis_es:'No planeaba llevar el arma a la escuela. Planeaba llevarla a casa. Esa distinción, y lo que le cuesta mantenerla, es el motor de El Fusil del Profesor. Una novela literaria sobre un hombre que ha pasado su carrera enseñando a otros a pensar con claridad y que se encuentra, en un momento preciso y sin dramatismo, incapaz de hacerlo él mismo. Quince capítulos. Sin héroes. El tipo de violencia institucional que no deja marca visible.',
    synopsis:'He did not plan to bring the gun to school. He planned to bring it home. That distinction, and what it costs him to maintain it, is the engine of The Teacher\'s Gun. A literary novel about a man who has spent his career teaching others to think clearly and finds himself, at a precise and undramatic moment, no longer able to. Fifteen chapters. No heroes. The kind of institutional violence that leaves no visible mark.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Literary Fiction'],['Language','English & French'],['Pages','~290'],['Chapters','15'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  neural:   { key:'neural',   color:'#0A1A1A', orn:'◆', genre:'Speculative Fiction',
    title:'The Neural Mortgage', subtitle:"L'Hypothèque Neurale",
    lang:'EN / FR', pages:'~360p', series:'Standalone',
    seriesKey:null, vol:null, available:true, price:'From $15.99',
    synopsis_en:'In the near future, memory is collateral. You can borrow against it, defer it, restructure it, and lose it to a creditor if the payments stop. The Neural Mortgage follows a debtor navigating this system, not as a victim of it but as someone who understood the contract perfectly and signed it anyway. The English and French editions are independent parallel originals, not translations: the same story, two different first-person voices, two different ways of being in debt.',
    synopsis_fr:'Dans un futur proche, la mémoire est une garantie. On peut l\'emprunter, la différer, la restructurer, et la perdre au profit d\'un créancier si les paiements s\'arrêtent. L\'Hypothèque Neuronale suit un débiteur naviguant dans ce système, non pas comme une victime mais comme quelqu\'un qui a parfaitement compris le contrat et l\'a signé quand même. Les éditions anglaise et française sont des originaux parallèles indépendants, non des traductions: la même histoire, deux voix à la première personne différentes, deux façons différentes d\'être endetté.',
    synopsis_es:'En un futuro cercano, la memoria es garantía. Se puede tomar prestado contra ella, diferirla, reestructurarla, y perderla ante un acreedor si los pagos se detienen. La Hipoteca Neural sigue a un deudor que navega este sistema, no como víctima sino como alguien que entendió el contrato perfectamente y lo firmó de todos modos. Las ediciones en inglés y francés son originales paralelos independientes, no traducciones: la misma historia, dos voces en primera persona diferentes, dos maneras distintas de estar endeudado.',
    synopsis:'In the near future, memory is collateral. You can borrow against it, defer it, restructure it, and lose it to a creditor if the payments stop. The Neural Mortgage follows a debtor navigating this system, not as a victim of it but as someone who understood the contract perfectly and signed it anyway. The English and French editions are independent parallel originals, not translations: the same story, two different first-person voices, two different ways of being in debt.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Speculative Fiction · Noir Thriller'],['Language','English & French (parallel originals)'],['Chapters','15'],['Pages','~360'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  invisible:{ key:'invisible', color:'#1A0A2C', orn:'◆', genre:'Social Essay',
    title:'The Invisible Authority', subtitle:"L'Autorité Invisible",
    lang:'EN / FR', pages:'~250p', series:'Standalone',
    seriesKey:null, vol:null, available:true, price:'From $17.99',
    synopsis_en:'The most powerful person in any room is rarely the one with the title. The Invisible Authority is an essay about the other one: the person whose opinion reorganizes the conversation before it has been spoken, whose displeasure produces compliance without a single direct demand. This is a study of informal power in its purest form: how it is constructed, how it is maintained, and the specific conditions under which it collapses. The authority here is invisible. The damage it does is not.',
    synopsis_fr:'La personne la plus puissante dans une salle est rarement celle qui a le titre. L\'Autorité Invisible est un essai sur l\'autre: la personne dont l\'opinion réorganise la conversation avant qu\'elle ait été prononcée, dont le mécontentement produit la conformité sans une seule demande directe. C\'est une étude du pouvoir informel dans sa forme la plus pure: comment il est construit, comment il est maintenu, et les conditions spécifiques dans lesquelles il s\'effondre. L\'autorité ici est invisible. Les dommages qu\'elle cause ne le sont pas.',
    synopsis_es:'La persona más poderosa en cualquier sala rara vez es la que tiene el título. La Autoridad Invisible es un ensayo sobre la otra: la persona cuya opinión reorganiza la conversación antes de que se haya pronunciado, cuyo desagrado produce conformidad sin una sola demanda directa. Este es un estudio del poder informal en su forma más pura: cómo se construye, cómo se mantiene, y las condiciones específicas bajo las cuales colapsa. La autoridad aquí es invisible. El daño que hace no lo es.',
    synopsis:'The most powerful person in any room is rarely the one with the title. The Invisible Authority is an essay about the other one: the person whose opinion reorganizes the conversation before it has been spoken, whose displeasure produces compliance without a single direct demand. This is a study of informal power in its purest form: how it is constructed, how it is maintained, and the specific conditions under which it collapses. The authority here is invisible. The damage it does is not.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Social Essay · Nonfiction'],['Language','English & French'],['Pages','~250'],['Words','25,157 EN'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  haiti:    { key:'haiti',    color:'#8B3A1A', orn:'◆', genre:'Socio-Political Essay',
    title:'Haiti X-Ray', subtitle:'Cri de Coeur',
    lang:'EN / FR', pages:'~280p', series:'Standalone',
    seriesKey:null, vol:null, available:true, price:'From $16.99',
    synopsis_en:'This is not a book written about Haiti. It is a book written from inside it, by someone who has seen its institutions from the inside and has chosen to stop being tactful about what he found there. Haiti X-Ray is a socio-political essay that names what has failed, who benefited from the failure, and what a reconstruction would actually require: not as foreign intervention but as internal reckoning. The anger here is precise. The analysis is colder.',
    synopsis_fr:'Ce n\'est pas un livre écrit sur Haïti. C\'est un livre écrit de l\'intérieur, par quelqu\'un qui a vu ses institutions de l\'intérieur et a choisi de cesser d\'être diplomate sur ce qu\'il y a trouvé. Haiti X-Ray est un essai socio-politique qui nomme ce qui a échoué, qui a profité de l\'échec, et ce qu\'une reconstruction exigerait réellement: non pas comme intervention étrangère mais comme règlement de comptes intérieur. La colère ici est précise. L\'analyse est plus froide.',
    synopsis_es:'Este no es un libro escrito sobre Haití. Es un libro escrito desde adentro, por alguien que ha visto sus instituciones desde el interior y ha elegido dejar de ser diplomático sobre lo que encontró allí. Haiti X-Ray es un ensayo sociopolítico que nombra lo que ha fallado, quién se benefició del fracaso, y qué requeriría realmente una reconstrucción: no como intervención extranjera sino como ajuste de cuentas interno. La ira aquí es precisa. El análisis es más frío.',
    synopsis:'This is not a book written about Haiti. It is a book written from inside it, by someone who has seen its institutions from the inside and has chosen to stop being tactful about what he found there. Haiti X-Ray is a socio-political essay that names what has failed, who benefited from the failure, and what a reconstruction would actually require: not as foreign intervention but as internal reckoning. The anger here is precise. The analysis is colder.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Socio-Political Essay · Nonfiction'],['Language','English & French'],['Format','Print · eBook'],['Publisher','SPY ON THE RISE']] },

  neon:     { key:'neon',     color:'#0A0A1A', orn:'◆', genre:'Speculative Fiction',
    title:'Neon Shadows', subtitle:'Dystopian Speculative Fiction',
    lang:'EN', pages:'TBD', series:'Standalone',
    seriesKey:null, vol:null, available:false, price:'Coming 2028', release:'2028',
    synopsis:'Neon Shadows: dystopian speculative fiction. Full synopsis to be announced. Expected 2028.',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre','Speculative Fiction · Dystopian'],['Language','English'],['Publisher','SPY ON THE RISE']] },
  // ── THE MR / MS LITTLE SERIES (18 books) ──────────────────────

  little1:  { key:'little1',  color:'#2C4A6B', orn:'◆', genre:"Children's Illustrated Fiction",
    title:'Mr Little Scientist', subtitle:'Lab of Gigantic Things',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 1', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 1'],['Sense Axis','Sight'],['Tagline','Small eyes see big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little2:  { key:'little2',  color:'#4A2C6B', orn:'♩', genre:"Children's Illustrated Fiction",
    title:'Ms Little Musician', subtitle:'Concert of Gigantic Sounds',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 2', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 2'],['Sense Axis','Hearing'],['Tagline','Small ears hear big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little3:  { key:'little3',  color:'#2C6B4A', orn:'♡', genre:"Children's Illustrated Fiction",
    title:'Ms Little Doctor', subtitle:'Clinic of Gigantic Hearts',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 3', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 3'],['Sense Axis','Touch / Pulse'],['Tagline','Small hands heal big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little4:  { key:'little4',  color:'#6B4A2C', orn:'✒', genre:"Children's Illustrated Fiction",
    title:'Mr Little Journalist', subtitle:'Newsroom of Gigantic Stories',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 4', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 4'],['Sense Axis','Voice / Word'],['Tagline','Small words carry big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little5:  { key:'little5',  color:'#3A3A6B', orn:'⬡', genre:"Children's Illustrated Fiction",
    title:'Ms Little Architect', subtitle:'City of Gigantic Blueprints',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 5', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 5'],['Sense Axis','Spatial Vision'],['Tagline','Small plans build big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little6:  { key:'little6',  color:'#5A3A1A', orn:'⚙', genre:"Children's Illustrated Fiction",
    title:'Mr Little Mechanic', subtitle:'Garage of Gigantic Machines',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 6', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 6'],['Sense Axis','Diagnosis'],['Tagline','Small hands fix big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little7:  { key:'little7',  color:'#6B2C2C', orn:'✦', genre:"Children's Illustrated Fiction",
    title:'Ms Little Chef', subtitle:'Kitchen of Gigantic Flavors',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 7', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 7'],['Sense Axis','Taste / Smell'],['Tagline','Small flavors carry big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little8:  { key:'little8',  color:'#1A2C5A', orn:'◎', genre:"Children's Illustrated Fiction",
    title:'Mr Little President', subtitle:'Palace of Gigantic Decisions',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 8', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 8'],['Sense Axis','Intuition / Weight'],['Tagline','Small choices shape big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little9:  { key:'little9',  color:'#1A4A4A', orn:'▲', genre:"Children's Illustrated Fiction",
    title:'Ms Little Pilot', subtitle:'Sky of Gigantic Horizons',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 9', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 9'],['Sense Axis','Motion / Balance'],['Tagline','Small wings reach big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little10:  { key:'little10',  color:'#2C4A2C', orn:'◉', genre:"Children's Illustrated Fiction",
    title:'Mr Little Geopolitician', subtitle:'Map of Gigantic Choices',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 10', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 10'],['Sense Axis','Perspective'],['Tagline','Small maps hold big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little11:  { key:'little11',  color:'#3A5A1A', orn:'❧', genre:"Children's Illustrated Fiction",
    title:'Ms Little Farmer', subtitle:'Field of Gigantic Seasons',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 11', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 11'],['Sense Axis','Soil / Growth'],['Tagline','Small seeds grow big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little12:  { key:'little12',  color:'#1A3A5A', orn:'⌥', genre:"Children's Illustrated Fiction",
    title:'Mr Little Coder', subtitle:'Computer of Gigantic Instructions',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 12', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 12'],['Sense Axis','Logic / Pattern'],['Tagline','Small codes run big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little13:  { key:'little13',  color:'#5A2C4A', orn:'❤', genre:"Children's Illustrated Fiction",
    title:'Ms Little Social Worker', subtitle:'Community of Gigantic Connections',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 13', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 13'],['Sense Axis','Context / System'],['Tagline','Small voices carry big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little14:  { key:'little14',  color:'#2C5A3A', orn:'◈', genre:"Children's Illustrated Fiction",
    title:'Mr Little Climate Scientist', subtitle:'Atmosphere of Gigantic Signals',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 14', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 14'],['Sense Axis','Data / Time'],['Tagline','Small data reads big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little15:  { key:'little15',  color:'#4A1A4A', orn:'✦', genre:"Children's Illustrated Fiction",
    title:'Ms Little Poet', subtitle:'Library of Gigantic Words',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 15', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 15'],['Sense Axis','Sound of Meaning'],['Tagline','Small words mean big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little16:  { key:'little16',  color:'#1A1A4A', orn:'★', genre:"Children's Illustrated Fiction",
    title:'Ms Little Astronaut', subtitle:'Station of Gigantic Silences',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 16', available:false, price:'Coming 2027', release:'2027',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 16'],['Sense Axis','Weightlessness'],['Tagline','Small steps reach big universe.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little17:  { key:'little17',  color:'#4A3A1A', orn:'◆', genre:"Children's Illustrated Fiction",
    title:'Mr Little Entrepreneur', subtitle:'Workshop of Gigantic Ideas',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 17', available:false, price:'Coming 2028', release:'2028',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 17'],['Sense Axis','Imagination / Making'],['Tagline','Small ideas change big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },
  little18:  { key:'little18',  color:'#3A1A4A', orn:'◆', genre:"Children's Illustrated Fiction",
    title:'Ms Little Nurse', subtitle:'Ward of Gigantic Rhythms',
    lang:'EN', pages:'~48p', series:'The Mr / Ms Little Series',
    seriesKey:'little', vol:'Tome 18', available:false, price:'Coming 2028', release:'2028',
    synopsis:'',
    links:{print:{amazon:'#',ingram:'#',bn:'#',bookbaby:'#'},ebook:{kindle:'#',apple:'#',kobo:'#',google:'#',nook:'#'},audio:{audible:'#',apple_audio:'#'}},
    details:[['Genre',"Children's Illustrated Fiction"],['Series','The Mr / Ms Little Series · Tome 18'],['Sense Axis','Continuity / Rhythm'],['Tagline','Small rhythms heal big world.'],['Language','English'],['Format','Illustrated hardcover'],['Publisher','SPY ON THE RISE']] },

};

const SERIES = {
  mercer:  { key:'mercer',  num:'01', tag:'Spy Thriller', name:'The Mercer Files',
    volumes:['mercer1','mercer2','mercer3','mercer4','mercer5','mercer6','mercer7'], totalVols:7,
    desc:'Seven-volume spy thriller series. All 7 books complete in EN+FR bilingual editions. From The Kremlin Coup to The Last Architecture, following operative Mercer across the global theater of intelligence, betrayal, and institutional power.',
    conceptHead:'Institutional Intelligence',
    conceptBody:'The Mercer Files is built on one thesis: intelligence work is ultimately an exercise in institutional memory, and betrayal is always structural before it is personal. Each volume escalates from tactical field operations (Books 1–3) to the philosophical architecture of power (Books 4–7). Reading the series in order reveals a single continuous argument about how systems, not individuals, determine outcomes.',
    stats:[{n:'7',l:{en:'Volumes',fr:'Volumes',es:'Volúmenes'}},{n:'3',l:{en:'Available Now',fr:'Disponibles',es:'Disponibles'}},{n:'EN/FR',l:{en:'Bilingual',fr:'Bilingue',es:'Bilingüe'}}] },

  anatomy: { key:'anatomy', num:'02', tag:'Behavioral Sociology', name:'Anatomy of Micro-Societies',
    volumes:['anatomy1','anatomy2','anatomy3','anatomy4','anatomy5','anatomy6','anatomy7','anatomy8'], totalVols:8,
    desc:'Eight-volume clinical ethnography of closed social groups. Each volume autopsies a different micro-society through the Pompée Analytical Triad, from corporate ambition to virtual tribes to the bonds that transform us.',
    conceptHead:'The Pompée Analytical Triad',
    conceptBody:'Every volume applies the same three-stage method: sensory observation (what the author sees and records in the field), original sociological concept (the framework generated by that observation, named and defined), and iron law (the invariable behavioral rule that governs this micro-society, stated without qualification). The Triad produces a consistent analytical register across all eight volumes while each applies it to radically different social environments.',
    stats:[{n:'8',l:{en:'Volumes',fr:'Volumes',es:'Volúmenes'}},{n:'5',l:{en:'Available Now',fr:'Disponibles',es:'Disponibles'}},{n:'3',l:{en:'In Production',fr:'En Production',es:'En Producción'}}] },

  crooked: { key:'crooked', num:'03', tag:'Historical Fiction', name:'The Crooked Cross Chronicles',
    volumes:['crooked1','crooked2','crooked3','crooked4','crooked5'], totalVols:5,
    desc:'Five-volume WWII and postwar historical fiction series. Each volume follows characters at threshold positions inside wartime institutional machinery, from Murder in the Bunker to The Last Myth.',
    conceptHead:'Threshold Positions',
    conceptBody:'Each book of the Chronicles follows a character who occupies a threshold position in the wartime structure: the orderly, the performer, the archivist, the librarian. These are individuals whose roles force proximity to atrocity without providing the conventional vocabulary of either complicity or heroism. The series asks: what does a person owe to history when history has already decided their value?',
    stats:[{n:'5',l:{en:'Volumes',fr:'Volumes',es:'Volúmenes'}},{n:'1',l:{en:'Available Now',fr:'Disponible',es:'Disponible'}},{n:'4',l:{en:'In Production',fr:'En Production',es:'En Producción'}}] },

  ir:      { key:'ir',      num:'04', tag:'Geopolitics', name:'IR Theory Works',
    volumes:['iran','warorbits','chess','chokepoints','evaporating','seatrial'], totalVols:6,
    desc:'Six-title geopolitical library, from Iran: The Laboratory to The War of Orbits, The Chess–Go Game, Chokepoints, The Evaporating Empire, and The Sea on Trial. Large-scale analysis of global power, resource competition, and emerging strategic theaters.',
    conceptHead:'Hybrid Board Theory',
    conceptBody:'The IR Theory Works share a common analytical assumption: that contemporary geopolitics cannot be understood through a single strategic logic. The Chess–Go Game introduces the theoretical framework. Chokepoints and The Evaporating Empire apply it to resource geography and hegemonic decline. The Sea on Trial extends it to international maritime law. The War of Orbits extends it to the orbital domain. Iran: The Laboratory applies it to the most consequential laboratory of contemporary statecraft.',
    stats:[{n:'6',l:{en:'Titles',fr:'Titres',es:'Títulos'}},{n:'5',l:{en:'Available Now',fr:'Disponibles',es:'Disponibles'}},{n:'EN/FR',l:{en:'Bilingual',fr:'Bilingue',es:'Bilingüe'}}] },

  poetry:  { key:'poetry',  num:'05', tag:'Poetry · Bilingual', name:'Atlas of the Unspoken',
    volumes:['atlas'], totalVols:1,
    desc:'Bilingual lyric poetry in the tradition of Rimbaud, Senghor, and Césaire. Two autonomous editions, not translation but parallel voice. EN+FR both validated and publication-ready.',
    conceptHead:'Parallel Voice, Not Translation',
    conceptBody:"Atlas of the Unspoken exists as two complete works. The English edition follows a lyric logic of compressed imagery and spatial displacement. The French edition enters the tradition of the French lyric canon: Rimbaud's syntax, Prévert's directness, Senghor's cultural authority; and is a complete re-composition. The bilingual reader does not read one book in two languages. They read two books in dialogue.",
    stats:[{n:'1',l:{en:'Volume',fr:'Volume',es:'Volumen'}},{n:'2',l:{en:'Editions',fr:'Éditions',es:'Ediciones'}}] },
  little:  { key:'little',  num:'06', tag:"Children's Illustrated Fiction", name:'The Mr / Ms Little Series',
    volumes:['little1','little2','little3','little4','little5','little6','little7','little8','little9','little10','little11','little12','little13','little14','little15','little16','little17','little18'], totalVols:18,
    desc:"Eighteen illustrated children's books celebrating curiosity, wonder, and the power of small people in a large world. Each volume follows a child discovering a profession through the lens of one of the five senses.",
    conceptHead:'One Small Person. One Large World.',
    conceptBody:"Each volume of The Mr / Ms Little Series is anchored to one sensory axis (sight, hearing, touch, taste, or spatial awareness) and one profession. The series closing argument: eighteen ways of being ready for the world. Illustrated in original ink line-art with selective flat color wash, in the register of E.H. Shepard.",
    stats:[{n:'18',l:{en:'Volumes',fr:'Volumes',es:'Volúmenes'}},{n:'16',l:{en:'Backbone docs complete',fr:'Docs structure complets',es:'Docs estructura completos'}}] },

};

const PLATFORMS = {
  print: [
    {name:'Amazon KDP',abbr:'AMZ',color:'#FF9900',note:'Fast delivery worldwide',feat:true,key:'amazon',url:'#'},
    {name:'IngramSpark',abbr:'IGS',color:'#003DA5',note:'Trade & library editions',key:'ingram',url:'#'},
    {name:'Barnes & Noble',abbr:'B&N',color:'#1E3F7A',note:'US retail & online',key:'bn',url:'#'},
    {name:'BookBaby',abbr:'BB',color:'#7A1515',note:'Direct from publisher',key:'bookbaby',url:'#'},
  ],
  ebook: [
    {name:'Amazon Kindle',abbr:'KDL',color:'#FF9900',note:'Instant download',feat:true,key:'kindle',url:'#'},
    {name:'Apple Books',abbr:'APL',color:'#FC3259',note:'iOS & Mac',key:'apple',url:'#'},
    {name:'Kobo',abbr:'KBO',color:'#E2231A',note:'Global eBook leader',key:'kobo',url:'#'},
    {name:'Google Play Books',abbr:'GPB',color:'#4285F4',note:'All Android devices',key:'google',url:'#'},
    {name:'Barnes & Noble Nook',abbr:'NOK',color:'#1E3F7A',note:'US digital store',key:'nook',url:'#'},
  ],
  audio: [
    {name:'Amazon Audible',abbr:'AUD',color:'#FF9900',note:'Premium audiobooks',feat:true,key:'audible',url:'#'},
    {name:'Apple Books Audio',abbr:'APL',color:'#FC3259',note:'iOS & Mac',key:'apple_audio',url:'#'},
  ]
};

const BUNDLES = [
  {id:'mercer-all',types:['bundle','series'],badge:'bundle',
    title:'The Complete Mercer Files',subtitle:'All 7 volumes: The Kremlin Coup through The Last Architecture',
    books:['Book 1: The Kremlin Coup','Book 2: The Prague Protocol','Book 3: The Beijing Residue','Book 4: The Zurich Legacy','Book 5: The Oslo Signal','Book 6','Book 7: The Last Architecture'],
    orig:'$104.93',disc:'$68.20',save:'35% Off. Save $36.73',isGold:false,timer:false},

  {id:'geopolitics',types:['bundle','limited'],badge:'limited',
    title:'The Geopolitics Pack',subtitle:'6-title IR Theory Works library, complete collection',
    books:['Iran: The Laboratory','The War of Orbits','The Chess–Go Game','Chokepoints','The Evaporating Empire','The Sea on Trial'],
    orig:'$107.94',disc:'$64.76',save:'40% Off. Save $43.18',isGold:true,timer:true},

  {id:'wave1-2026',types:['bundle','limited'],badge:'new',
    title:'First Wave 2026: Launch Collection',subtitle:'All 8 titles of the inaugural 2026 publication wave',
    books:['Iran: The Laboratory','The War of Orbits','Murder in the Bunker','The Neural Mortgage','The Invisible Authority','Atlas of the Unspoken','Haiti X-Ray','Mercer Files Book 1'],
    orig:'$135.91',disc:'$81.54',save:'40% Off. Save $54.37',isGold:true,timer:true},

  {id:'intro-sotr',types:['promo'],badge:'promo',
    title:'Introduction to SOTR',subtitle:'3 essential titles for new readers',
    books:["The Teacher's Gun",'Anatomy Vol. 1: The Nave of Ambitions','The Chess–Go Game'],
    orig:'$50.97',disc:'$35.67',save:'30% Off. Save $15.30',isGold:false,timer:false},

  {id:'bilingual-pair',types:['bilingual','bundle'],badge:'bundle',
    title:'Bilingual Edition Pair',subtitle:'One title, both EN and FR editions together',
    books:['Any title (EN edition)','Same title (FR edition)'],
    orig:'$31.98',disc:'$23.98',save:'25% Off. Save $8.00',isGold:false,timer:false},

  {id:'sociology-arc',types:['bundle','series'],badge:'bundle',
    title:'The Sociology Arc',subtitle:'Anatomy of Micro-Societies, Vols. 1–3',
    books:['Vol. 1: The Nave of Ambitions','Vol. 2: The Open-Space of Predators','Vol. 3: The Virtual Tribes'],
    orig:'$47.97',disc:'$31.17',save:'35% Off. Save $16.80',isGold:false,timer:false},

  {id:'dark-fiction',types:['bundle'],badge:'bundle',
    title:'Dark Fiction Trilogy',subtitle:'Three literary and speculative fiction titles',
    books:["The Teacher's Gun",'The Neural Mortgage','Murder in the Bunker'],
    orig:'$46.97',disc:'$32.87',save:'30% Off. Save $14.10',isGold:false,timer:false},

  {id:'reader-starter',types:['promo','limited'],badge:'limited',
    title:'New Reader Starter Pack',subtitle:'Best entry points, deeply discounted',
    books:["The Teacher's Gun",'Atlas of the Unspoken','Mercer Files Book 1: The Kremlin Coup'],
    orig:'$41.97',disc:'$25.18',save:'40% Off. Save $16.79',isGold:true,timer:true},

  {id:'fr-selection',types:['bilingual'],badge:'bundle',
    title:'La Sélection Française',subtitle:'Best French editions, bilingual reading experience',
    books:["Atlas de l'Inexprimé","Le Fusil du Professeur","L'Hypothèque Neurale","L'Iran : Le Laboratoire"],
    orig:'$67.96',disc:'$47.57',save:'30% Off. Save $20.39',isGold:false,timer:false},

  {id:'geopolitics-ir',types:['bundle','series'],badge:'bundle',
    title:'The IR Theory Core',subtitle:'The foundational three geopolitical essays',
    books:['The Chess–Go Game','The Sea on Trial','The Evaporating Empire'],
    orig:'$53.97',disc:'$35.08',save:'35% Off. Save $18.89',isGold:false,timer:false},
];

/* ══════════════════════════════════════
   BOOK COVER BUILDER
══════════════════════════════════════ */
function buildCover(b, size='normal'){
  const fs = size==='small' ? '10px' : size==='mini' ? '8px' : '13px';

  const imgHtml = b.image
    ? `<img src="${b.image}?v=${Date.now()}" alt="${b.title.replace(/"/g,'')}"
         loading="lazy"
         style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;"
         onerror="this.style.display='none'">`
    : '';

  if(!b.available){
    return `<div class="book-cover book-cover-unavail" style="position:relative;">
      <div class="book-cover-bg" style="background:${b.color};"></div>
      ${imgHtml ? `<div style="position:absolute;inset:0;overflow:hidden;border-radius:inherit;">${imgHtml}<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div></div>` : ''}
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;z-index:2;">
        <div class="unavail-icon">🔒</div>
        <div class="unavail-label en">${b.release||'Coming Soon'}</div>
        <div class="unavail-label fr">${b.release||'À Venir'}</div>
        <div class="unavail-label es">${b.release||'Próximamente'}</div>
        <div style="font-family:var(--display);font-size:${fs};font-weight:700;color:rgba(255,255,255,0.75);margin-top:6px;line-height:1.25;">${b.title}</div>
      </div>
      ${b.release && b.release!=='TBD' ? `<div class="release-banner" style="z-index:3;">${b.release}</div>` : ''}
    </div>`;
  }

  return `<div class="book-cover" style="position:relative;">
    <div class="book-cover-bg" style="background:${b.color};"></div>
    ${imgHtml ? `<div style="position:absolute;inset:0;overflow:hidden;border-radius:inherit;">${imgHtml}</div>` : ''}
    <div class="book-cover-top" style="position:absolute;top:.7rem;left:.7rem;right:.7rem;z-index:2;">
      <span class="bc-genre-pill">${b.genre}</span>
    </div>
    <div class="book-cover-overlay" style="z-index:2;">
      ${!b.image ? `<div class="bc-orn">${b.orn}</div>
      <div class="bc-title-text" style="font-size:${fs};">${b.title}</div>
      ${b.subtitle && !b.subtitle.includes('Coming') ? `<div class="bc-subtitle-text">${b.subtitle}</div>` : ''}` : ''}
    </div>
  </div>`;
}

function buildBookCard(b, showVol=false){
  return `<div class="book-card clickable-card" onclick="openBook('${b.key}')" style="overflow:hidden;" role="button" tabindex="0" aria-label="Open details for ${b.title}">
    <div style="position:relative;">${buildCover(b)}</div>
    <div class="book-card-body">
      <div class="book-card-title">${b.title}</div>
      <div class="book-card-meta">${b.genre}${showVol && b.vol ? ' · '+b.vol : ''}</div>
      ${b.available ? `<div class="book-card-price">${b.price}</div>` : `<div class="book-card-coming">${b.price}</div>`}
    </div>
  </div>`;
}

/* ══════════════════════════════════════
   RENDER HOME
══════════════════════════════════════ */
function renderHomeCatalog(){
  const featured = ['mercer1','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1','anatomy1'];
  document.getElementById('home-catalog-grid').innerHTML = featured.map(k=>buildBookCard(BOOKS[k])).join('');
}

function renderHomeSeriesGrid(){
  document.getElementById('home-series-grid').innerHTML = Object.values(SERIES).map(s=>`
    <div class="series-overview-card" onclick="openSeries('${s.key}')" role="button" tabindex="0" aria-label="Explore ${s.name}">
      <div class="soc-num">${s.num}</div>
      <div class="soc-tag">${s.tag}</div>
      <div class="soc-name">${s.name}</div>
      <div class="soc-desc">${s.desc}</div>
      <div class="soc-count">${s.totalVols} <span class="en">volumes</span><span class="fr">volumes</span><span class="es">volúmenes</span> · EN/FR <span class="soc-arrow">→</span></div>
    </div>`).join('');
}

function renderHeroMosaic(){
  const keys = ['mercer1','iran','anatomy2','chess','atlas','neural'];
  document.getElementById('hero-mosaic').innerHTML = keys.map(k=>{
    const b=BOOKS[k];
    return `<div class="hero-mini-card" onclick="openBook('${b.key}')" aria-label="${b.title}">
      <div class="hero-mini-inner" style="background:${b.color};">
        <div class="hero-mini-content"><div class="hmc-genre">${b.genre}</div><div class="hmc-title">${b.title}</div><div class="hmc-orn">${b.orn}</div></div>
      </div>
    </div>`;
  }).join('');
}

function renderBBPreviews(){
  const prev = [
    {badge:'bundle',bgBadge:'var(--bg-dark)',name:{en:'The Complete Mercer',fr:'Mercer Intégral',es:'Mercer Completo'},save:{en:'All 7 volumes · Save 35%',fr:'7 volumes · Économisez 35%',es:'7 volúmenes · Ahorra 35%'}},
    {badge:'promo',bgBadge:'var(--crimson)',name:{en:'New Reader Pack',fr:'Pack Nouveau Lecteur',es:'Pack Nuevo Lector'},save:{en:'3 titles · Save 30%',fr:'3 titres · Économisez 30%',es:'3 títulos · Ahorra 30%'}},
    {badge:'limited',bgBadge:'var(--gold)',name:{en:'Geopolitics Pack',fr:'Pack Géopolitique',es:'Pack Geopolítico'},save:{en:'4 titles · Save 40%',fr:'4 titres · Économisez 40%',es:'4 títulos · Ahorra 40%'}},
    {badge:'bilingual',bgBadge:'var(--green)',name:{en:'Bilingual Pair',fr:'Duo Bilingue',es:'Par Bilingüe'},save:{en:'EN + FR · Save 25%',fr:'EN + FR · Économisez 25%',es:'EN + FR · Ahorra 25%'}},
  ];
  const labels = {bundle:{en:'Bundle',fr:'Lot',es:'Paquete'},promo:{en:'Promo',fr:'Promo',es:'Promo'},limited:{en:'⚡ Limited',fr:'⚡ Limité',es:'⚡ Limitado'},bilingual:{en:'Bilingual',fr:'Bilingue',es:'Bilingüe'}};
  document.getElementById('bb-previews').innerHTML = prev.map(p=>`
    <div class="bb-prev-card" onclick="showPage('bundles')">
      <span class="bbp-badge" style="background:${p.bgBadge};color:#fff;"><span class="en">${labels[p.badge]?.en||p.badge}</span><span class="fr">${labels[p.badge]?.fr||p.badge}</span><span class="es">${labels[p.badge]?.es||p.badge}</span></span>
      <div class="bbp-name en">${p.name.en}</div><div class="bbp-name fr">${p.name.fr}</div><div class="bbp-name es">${p.name.es}</div>
      <div class="bbp-savings en">${p.save.en}</div><div class="bbp-savings fr">${p.save.fr}</div><div class="bbp-savings es">${p.save.es}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   SERIES LIST PAGE
══════════════════════════════════════ */
function renderSeriesListPage(){
  document.getElementById('series-list-grid').innerHTML = Object.values(SERIES).map(s=>`
    <div class="series-overview-card" onclick="openSeries('${s.key}')" role="button" tabindex="0">
      <div class="soc-num">${s.num}</div>
      <div class="soc-tag">${s.tag}</div>
      <div class="soc-name">${s.name}</div>
      <div class="soc-desc">${s.desc}</div>
      <div class="soc-count">${s.totalVols} <span class="en">volumes · Explore →</span><span class="fr">volumes · Explorer →</span><span class="es">volúmenes · Explorar →</span></div>
    </div>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BOOK MODAL - points (b)(e)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
let currentFmt = 'print';
function openBook(key){
  const b = BOOKS[key];
  // Cover in modal header
  document.getElementById('modal-cover-box').innerHTML = buildCover(b,'small');
  document.getElementById('mh-genre').textContent = b.genre;
  document.getElementById('mh-title').textContent = b.title;
  document.getElementById('mh-subtitle').textContent = b.subtitle || '';
  document.getElementById('mh-meta').innerHTML = `<span>${b.lang}</span><span style="margin:0 5px;opacity:.25;">·</span><span>${b.pages}</span><span style="margin:0 5px;opacity:.25;">·</span><span>${b.series}</span>`;
  // Unavailable notice + email signup
  const _safeTitle = b.title.replace(/'/g,'').replace(/"/g,'');
  document.getElementById('mh-unavail').innerHTML = !b.available
    ? `<div class="unavail-notice" id="unavail-${b.key}">
        <div class="un-title en">Coming ${b.release||'Soon'}</div>
        <div class="un-title fr">Sortie ${b.release||'prochaine'}</div>
        <div class="un-title es">Llegando ${b.release||'pronto'}</div>
        <div class="un-body en">Be the first to know when this title launches.</div>
        <div class="un-body fr">Soyez le premier inform&eacute; du lancement.</div>
        <div class="un-body es">S&eacute; el primero en saber cuando se lance.</div>
        <div id="unf-${b.key}">
          <div style="display:flex;gap:6px;margin-top:.6rem;flex-wrap:wrap;">
            <input type="email" id="un-inp-${b.key}" class="un-email-inp"
              placeholder="your@email.com" autocomplete="email"
              onkeydown="if(event.key==='Enter')notifySignup('${b.key}','${_safeTitle}')"/>
            <button class="un-notify-btn"
              onclick="notifySignup('${b.key}','${_safeTitle}')">
              <span class="en">Notify Me</span>
              <span class="fr">M'avertir</span>
              <span class="es">Notificarme</span>
            </button>
          </div>
          <div id="un-msg-${b.key}" style="display:none;font-size:12px;margin-top:6px;"></div>
        </div>
      </div>`
    : '';
  // Synopsis
  const _activeLang = document.body.getAttribute('data-lang') || 'en';
  const _synopsis = (_activeLang === 'fr' && b.synopsis_fr) ? b.synopsis_fr
    : (_activeLang === 'es' && b.synopsis_es) ? b.synopsis_es
    : (b.synopsis_en || b.synopsis || '');
  document.getElementById('modal-synopsis').textContent = _synopsis;
  const detailFields = [
    b.genre  ? [['Genre','Genre','Género'], b.genre] : null,
    b.lang   ? [['Language','Langue','Idioma'], b.lang] : null,
    b.pages  ? [['Pages','Pages','Páginas'], b.pages] : null,
    b.series ? [['Series','Série','Serie'], b.series + (b.vol ? ' Vol. ' + b.vol : '')] : null,
    b.release? [['Release','Sortie','Lanzamiento'], b.release] : null,
  ].filter(Boolean);
  document.getElementById('modal-details').innerHTML = detailFields.length
    ? detailFields.map(([labels,v])=>`<div><div class="sd-label en">${labels[0]}</div><div class="sd-label fr">${labels[1]}</div><div class="sd-label es">${labels[2]}</div><div class="sd-value">${v}</div></div>`).join('')
    : `<div><div class="sd-label en">Status</div><div class="sd-label fr">Statut</div><div class="sd-label es">Estado</div><div class="sd-value en">In Production</div><div class="sd-value fr">En Production</div><div class="sd-value es">En Producción</div></div>`;
  // Buy tab availability
  if(!b.available){
    document.getElementById('platform-list').innerHTML = `<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:0.5rem 0;" class="en">Not yet available for purchase. Subscribe to our newsletter to be notified.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:0.5rem 0;" class="fr">Pas encore disponible. Abonnez-vous à notre newsletter pour être notifié.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:0.5rem 0;" class="es">Aún no disponible. Suscríbete a nuestra newsletter para recibir notificaciones.</p>`;
  } else {
    currentFmt = 'print';
    document.querySelectorAll('.ft-btn').forEach((btn,i)=>btn.classList.toggle('active',i===0));
    renderPlatforms('print');
  }
  // Related titles - point (e): same series layer + same genre layer
  renderRelated(b);
  // Reset tabs
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.modal-tab')[0].classList.add('active');
  document.querySelectorAll('.modal-tab')[3].classList.add('active');
  document.querySelectorAll('.modal-tab')[6].classList.add('active');
  document.querySelectorAll('.modal-tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-synopsis').classList.add('active');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}

async function notifySignup(bookKey, bookTitle) {
  const input = document.getElementById('un-inp-' + bookKey);
  const msgEl = document.getElementById('un-msg-' + bookKey);
  const formEl = document.getElementById('unf-' + bookKey);
  if (!input || !msgEl) return;

  const email = (input.value || '').trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    msgEl.style.display = 'block';
    msgEl.style.color = '#E57373';
    msgEl.textContent = 'Please enter a valid email address.';
    return;
  }

  const btn = formEl ? formEl.querySelector('.un-notify-btn') : null;
  if (btn) { btn.disabled = true; btn.style.opacity = '.5'; }

  try {
    const lang = document.body.getAttribute('data-lang') || 'en';
    const r = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lang, bookKey, bookTitle: bookTitle || bookKey, type: 'prelaunch' }),
    });
    const d = await r.json();

    if (r.ok) {
      const flexDiv = formEl ? formEl.querySelector('div') : null;
      if (flexDiv) flexDiv.style.display = 'none';
      msgEl.style.display = 'block';
      msgEl.style.color = '#4AC77A';
      msgEl.innerHTML = `
        <span class="en">&#10003; You are on the list for <em>${bookTitle||bookKey}</em>. We will notify you on launch day.</span>
        <span class="fr">&#10003; Vous &ecirc;tes sur la liste pour <em>${bookTitle||bookKey}</em>.</span>
        <span class="es">&#10003; Est&aacute;s en la lista para <em>${bookTitle||bookKey}</em>.</span>`;
    } else {
      msgEl.style.display = 'block';
      msgEl.style.color = '#E57373';
      msgEl.textContent = d.error || 'Something went wrong. Please try again.';
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
  } catch {
    msgEl.style.display = 'block';
    msgEl.style.color = '#E57373';
    msgEl.textContent = 'Connection error. Please try again.';
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}

function renderRelated(b){
  // Layer 1: same series (excluding self)
  const sameSeries = b.seriesKey
    ? Object.values(BOOKS).filter(bk=>bk.key!==b.key && bk.seriesKey===b.seriesKey)
    : [];
  // Layer 2: same genre (excluding self and already shown in series)
  const seriesKeys = new Set(sameSeries.map(bk=>bk.key));
  const sameGenre = Object.values(BOOKS).filter(bk=>
    bk.key!==b.key &&
    !seriesKeys.has(bk.key) &&
    bk.genre===b.genre
  );
  // Layer 3: related standalone (different genre, curated by hand)
  let html = '';
  if(sameSeries.length){
    html += `<p class="related-group-label en">Other books in ${b.series}</p>
             <p class="related-group-label fr">Autres livres dans ${b.series}</p>
             <p class="related-group-label es">Otros libros de ${b.series}</p>
             <div class="related-mini-grid">${sameSeries.map(bk=>buildRelatedCard(bk)).join('')}</div>`;
  }
  if(sameGenre.length){
    html += `<p class="related-group-label en" style="margin-top:1.75rem;">More in <em>${b.genre}</em></p>
             <p class="related-group-label fr" style="margin-top:1.75rem;">Plus dans <em>${b.genre}</em></p>
             <p class="related-group-label es" style="margin-top:1.75rem;">Más en <em>${b.genre}</em></p>
             <div class="related-mini-grid">${sameGenre.slice(0,6).map(bk=>buildRelatedCard(bk)).join('')}</div>`;
  }
  if(!sameSeries.length && !sameGenre.length){
    html += `<p class="related-empty en">No related titles available yet in this genre.</p>
             <p class="related-empty fr">Aucun titre associé disponible pour ce genre.</p>
             <p class="related-empty es">No hay títulos relacionados disponibles aún.</p>`;
  }
  document.getElementById('related-content').innerHTML = html;
}

function buildRelatedCard(b){
  return `<div class="book-card clickable-card" onclick="closeModal();setTimeout(()=>openBook('${b.key}'),160)" role="button" tabindex="0" style="overflow:hidden;">
    <div>${buildCover(b,'small')}</div>
    <div class="book-card-body">
      <div class="book-card-title" style="font-size:12px;">${b.title}</div>
      ${b.available ? `<div class="book-card-price" style="font-size:12px;">${b.price}</div>` : `<div class="book-card-coming" style="font-size:11px;">${b.price}</div>`}
    </div>
  </div>`;
}

function switchTab(id, btn){
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.modal-tab-panel').forEach(p=>p.classList.remove('active'));
  // Activate all language variants of this tab position
  document.querySelectorAll('.modal-tab').forEach(t=>{
    if(t.getAttribute('onclick')===`switchTab('${id}',this)`) t.classList.add('active');
  });
  document.getElementById('tab-'+id).classList.add('active');
}

function setFmt(fmt, btn){
  currentFmt=fmt;
  document.querySelectorAll('.ft-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPlatforms(fmt);
}

function renderPlatforms(fmt){
  const ps=PLATFORMS[fmt]||[];
  if(!ps.length){ document.getElementById('platform-list').innerHTML='<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="en">Coming soon for this format.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="fr">Disponible prochainement.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);" class="es">Próximamente.</p>'; return; }
  document.getElementById('platform-list').innerHTML=ps.map(p=>`
    <div class="platform-row ${p.feat?'feat':''}">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="pr-icon" style="background:${p.color};">${p.abbr}</div>
        <div><div class="pr-name">${p.name}${p.feat?'<span class="badge-rec">Recommended</span>':''}</div><div class="pr-note">${p.note}</div></div>
      </div>
      <a href="${p.url}" class="btn-buy" target="_blank" rel="noopener">
        <span class="en">Buy</span><span class="fr">Acheter</span><span class="es">Comprar</span>
      </a>
    </div>`).join('');
}

function closeModal(){ document.getElementById('modal-overlay').classList.remove('open'); document.body.style.overflow=''; }
function closeMBg(e){ if(e.target===document.getElementById('modal-overlay')) closeModal(); }

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUNDLES PAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const BADGE_CLASSES = {bundle:'badge-bundle',promo:'badge-promo',limited:'badge-limited',new:'badge-new'};
const BADGE_LABELS  = {bundle:{en:'Bundle',fr:'Lot',es:'Paquete'},promo:{en:'Promotion',fr:'Promotion',es:'Promoción'},limited:{en:'&#9889; Limited Time',fr:'&#9889; Durée Limitée',es:'&#9889; Tiempo Limitado'},new:{en:'New',fr:'Nouveau',es:'Nuevo'}};
function renderBundles(filter){
  const data = filter==='all' ? BUNDLES : BUNDLES.filter(b=>b.types.includes(filter));
  document.getElementById('bundles-grid').innerHTML = data.map(b=>`
    <div class="bundle-card ${b.isGold?'gold-card':''}" onclick="openBundle('${b.id}')"
      <div class="bc-head">
        <div class="bc-badges"><span class="badge-type ${BADGE_CLASSES[b.badge]||'badge-bundle'}"><span class="en">${BADGE_LABELS[b.badge]?.en||''}</span><span class="fr">${BADGE_LABELS[b.badge]?.fr||''}</span><span class="es">${BADGE_LABELS[b.badge]?.es||''}</span></span></div>
        <div class="bc-title">${b.title}</div><div class="bc-subtitle">${b.subtitle}</div>
      </div>
      <div class="bc-books">${b.books.map(bk=>`<span class="bk-chip">${bk}</span>`).join('')}</div>
      <div class="bc-foot">
        <div class="bc-foot-row">
          <div><div class="bc-orig">${b.orig}</div><div class="bc-disc">${b.disc}</div><div class="bc-save ${b.isGold?'gold':''}">${b.save}</div></div>
          ${b.timer?`<div class="timer-block"><div class="bc-timer-label en">Ends in</div><div class="bc-timer-label fr">Se termine dans</div><div class="bc-timer-label es">Termina en</div><div class="bc-countdown" id="timer-${b.id}">-</div></div>`:''}
        </div>
        <button class="bc-buy-btn" onclick="event.stopPropagation();openBundle('${b.id}')">
          <span class="en">BUY THIS BUNDLE</span>
          <span class="fr">ACHETER CE LOT</span>
          <span class="es">COMPRAR ESTE PAQUETE</span>
        </button>
      </div>
    </div>`).join('');
  tickTimers();
}
function filterBundles(filter, btn){
  document.querySelectorAll('.bf-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderBundles(filter);
}

function openBundle(id) {
  const b = BUNDLES.find(x => x.id === id);
  if (!b) return;

  const bookList = b.books.map(bk => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);">
      <span style="color:var(--crimson);font-size:12px;">◆</span>
      <span style="font-family:var(--body);font-size:14px;color:var(--text-primary);">${bk}</span>
    </div>`).join('');

  const savings = `
    <div style="text-align:center;padding:1.25rem;background:var(--bg-muted);border-radius:var(--r);margin:1rem 0;">
      <div style="font-family:var(--ui);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">
        <span class="en">Bundle Price</span><span class="fr">Prix du Lot</span><span class="es">Precio del Paquete</span>
      </div>
      <div style="font-family:var(--display);font-size:36px;font-weight:700;color:var(--crimson);line-height:1;">${b.disc}</div>
      <div style="font-family:var(--ui);font-size:13px;color:var(--text-muted);text-decoration:line-through;margin-top:4px;">${b.orig}</div>
      <div style="display:inline-block;margin-top:8px;background:var(--green-bg);color:var(--green);font-family:var(--ui);font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">${b.save}</div>
    </div>`;

  const timerHtml = b.timer ? `
    <div style="text-align:center;background:var(--gold-bg);border:1px solid var(--gold-border);border-radius:var(--r);padding:.75rem;margin-bottom:1rem;">
      <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);">
        <span class="en">&#9889; Offer ends in</span>
        <span class="fr">&#9889; Offre se termine dans</span>
        <span class="es">&#9889; Oferta termina en</span>
      </div>
      <div class="bc-countdown" id="bundle-modal-timer" style="font-family:var(--display);font-size:22px;font-weight:700;color:var(--gold);margin-top:4px;">—</div>
    </div>` : '';

  const featPrint = (PLATFORMS.print || []).filter(p => p.feat);
  const retailersHtml = featPrint.length ? `
    <div style="margin-top:1rem;">
      <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.75rem;">
        <span class="en">Purchase via</span><span class="fr">Acheter via</span><span class="es">Comprar en</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${featPrint.map(p=>`
          <a href="${p.url}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1.5px solid var(--crimson-mid);border-radius:var(--r);background:var(--crimson-pale);text-decoration:none;transition:border-color .15s;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:30px;height:30px;border-radius:3px;background:${p.color};display:flex;align-items:center;justify-content:center;font-family:var(--ui);font-size:9px;font-weight:700;color:#fff;">${p.abbr}</div>
              <div>
                <div style="font-family:var(--ui);font-size:14px;font-weight:600;color:var(--text-primary);">${p.name} <span style="font-size:9px;background:var(--crimson);color:#fff;padding:1px 6px;border-radius:2px;margin-left:4px;font-weight:700;letter-spacing:.08em;">BEST PRICE</span></div>
                <div style="font-family:var(--ui);font-size:11px;color:var(--text-muted);">${p.note}</div>
              </div>
            </div>
            <span style="font-family:var(--ui);font-size:11px;font-weight:700;letter-spacing:.08em;color:#fff;background:var(--crimson);padding:8px 16px;border-radius:var(--r);">
              <span class="en">Buy Bundle</span><span class="fr">Acheter</span><span class="es">Comprar</span>
            </span>
          </a>`).join('')}
      </div>
    </div>` : '';

  document.getElementById('mh-genre').textContent = (b.types||[]).map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(' · ');
  document.getElementById('mh-title').textContent = b.title;
  document.getElementById('mh-subtitle').textContent = b.subtitle;
  document.getElementById('mh-meta').innerHTML = `<span>${b.books.length} <span class="en">titles</span><span class="fr">titres</span><span class="es">títulos</span></span><span style="margin:0 5px;opacity:.25;">·</span><span class="en">Bundle Offer</span><span class="fr">Offre Groupée</span><span class="es">Oferta de Paquete</span>`;
  document.getElementById('mh-unavail').innerHTML = '';

  const buyBtnHtml = featPrint.length
    ? `<button class="bc-buy-btn" style="margin-top:1.25rem;" onclick="document.getElementById('modal-overlay').querySelector('.platform-list a')?.click()||document.querySelector('#tab-buy .btn-buy')?.click()">
        <span class="en">BUY THIS BUNDLE</span>
        <span class="fr">ACHETER CE LOT</span>
        <span class="es">COMPRAR ESTE PAQUETE</span>
      </button>`
    : '';

  document.getElementById('modal-synopsis').innerHTML = `
    <p style="font-family:var(--body);font-size:15px;line-height:1.8;color:var(--text-secondary);margin-bottom:1.25rem;">${b.subtitle}</p>
    ${timerHtml}
    ${savings}
    <div style="font-family:var(--ui);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.5rem;">
      <span class="en">Titles Included</span><span class="fr">Titres Inclus</span><span class="es">Títulos Incluidos</span>
    </div>
    ${bookList}
    ${buyBtnHtml}`;
  document.getElementById('modal-details').innerHTML = '';
  document.getElementById('platform-list').innerHTML = retailersHtml;

  const related = BUNDLES.filter(x => x.id !== b.id && (x.types||[]).some(t => (b.types||[]).includes(t))).slice(0, 4);
  document.getElementById('related-content').innerHTML = related.length
    ? `<p class="related-group-label en">Other Offers You Might Like</p>
       <p class="related-group-label fr">Autres Offres Similaires</p>
       <p class="related-group-label es">Otras Ofertas Similares</p>
       <div class="related-mini-grid">${related.map(rb=>`
         <div class="book-card clickable-card" onclick="openBundle('${rb.id}')">
           <div style="background:var(--bg-dark);padding:.75rem;border-radius:2px 2px 0 0;text-align:center;">
             <div style="font-family:var(--display);font-size:22px;font-weight:700;color:var(--gold);">${rb.disc}</div>
             <div style="font-family:var(--ui);font-size:10px;color:rgba(255,255,255,.4);text-decoration:line-through;">${rb.orig}</div>
           </div>
           <div class="book-card-body">
             <div class="book-card-title">${rb.title}</div>
             <div class="book-card-meta">${rb.books.length} titles</div>
             <div class="book-card-price">${rb.save}</div>
           </div>
         </div>`).join('')}</div>`
    : '<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:.5rem 0" class="en">No similar offers at this time.</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:.5rem 0" class="fr">Aucune offre similaire pour le moment.</p>';

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  if (b.timer) {
    const el = document.getElementById('bundle-modal-timer');
    if (el) {
      const update = () => {
        const diff = SALE_END - new Date();
        if (diff <= 0) { el.textContent = 'Expired'; return; }
        const h = String(Math.floor(diff/3600000)).padStart(2,'0');
        const m = String(Math.floor(diff%3600000/60000)).padStart(2,'0');
        const s = String(Math.floor(diff%60000/1000)).padStart(2,'0');
        el.textContent = `${h}:${m}:${s}`;
        setTimeout(update, 1000);
      };
      update();
    }
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   COUNTDOWN TIMERS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SALE_END = new Date('2026-06-30T23:59:59');
function tickTimers(){
  function tick(){
    const diff = SALE_END - new Date();
    if(diff<=0){ document.querySelectorAll('[id^="timer-"]').forEach(el=>el.textContent='Expired'); ['en','fr','es'].forEach(l=>{const c=document.getElementById('ct-'+l);if(c)c.textContent='Expired';}); return; }
    const h=String(Math.floor(diff/3600000)).padStart(2,'0');
    const m=String(Math.floor(diff%3600000/60000)).padStart(2,'0');
    const s=String(Math.floor(diff%60000/1000)).padStart(2,'0');
    const str=`${h}:${m}:${s}`;
    document.querySelectorAll('[id^="timer-"]').forEach(el=>el.textContent=str);
    ['en','fr','es'].forEach(l=>{const c=document.getElementById('ct-'+l);if(c)c.textContent=str;});
  }
  tick();
  if(!window._tmr){ window._tmr=true; setInterval(tick,1000); }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PAGE ROUTING
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg = document.getElementById('page-'+id);
  if(pg) pg.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  if(id==='home') document.querySelectorAll('#nl-home').forEach(l=>l.classList.add('active'));
  if(id==='series-list'||id==='series-detail'){ document.querySelectorAll('#nl-series').forEach(l=>l.classList.add('active')); renderSeriesListPage(); }
  if(id==='bundles'){ document.querySelectorAll('#nl-bundles').forEach(l=>l.classList.add('active')); renderBundles('all'); }
  document.getElementById('main-footer').style.display='block';
}
function openSeries(key){ SERIES[key]; const s=SERIES[key]; if(!s) return; openSeries2(key); }
function openSeries2(key){
  const s=SERIES[key];
  document.getElementById('sdp-breadcrumb').innerHTML=`<a onclick="showPage('home')" class="en">Home</a><a onclick="showPage('home')" class="fr">Accueil</a><a onclick="showPage('home')" class="es">Inicio</a><span>›</span><a onclick="showPage('series-list')" class="en">Series</a><a onclick="showPage('series-list')" class="fr">Séries</a><a onclick="showPage('series-list')" class="es">Series</a><span>›</span><span>${s.name}</span>`;
  document.getElementById('sdp-tag').textContent=s.tag;
  document.getElementById('sdp-title').innerHTML=s.name;
  document.getElementById('sdp-desc').textContent=s.desc;
  document.getElementById('sdp-stats').innerHTML=s.stats.map(st=>`<div><div class="sdp-stat-n">${st.n}</div><div class="sdp-stat-l en">${st.l.en}</div><div class="sdp-stat-l fr">${st.l.fr}</div><div class="sdp-stat-l es">${st.l.es}</div></div>`).join('');
  document.getElementById('sdp-concept-head').textContent=s.conceptHead;
  document.getElementById('sdp-concept-body').textContent=s.conceptBody;
  const avail=s.volumes.filter(k=>BOOKS[k]?.available).length;
  document.getElementById('sdp-books-head-en').textContent=`All ${s.volumes.length} Titles in This Series`;
  document.getElementById('sdp-books-head-fr').textContent=`Les ${s.volumes.length} Titres de Cette Série`;
  document.getElementById('sdp-books-head-es').textContent=`Los ${s.volumes.length} Títulos de Esta Serie`;
  document.getElementById('sdp-avail-count').innerHTML=`<span class="en">${avail} available · ${s.volumes.length-avail} coming soon</span><span class="fr">${avail} disponibles · ${s.volumes.length-avail} à venir</span><span class="es">${avail} disponibles · ${s.volumes.length-avail} próximamente</span>`;
  document.getElementById('sdp-books-grid').innerHTML=s.volumes.map(k=>{
    const b=BOOKS[k];if(!b)return '';
    return `<div class="book-card clickable-card" onclick="openBook('${b.key}')" role="button" tabindex="0" style="position:relative;overflow:hidden;">
      <div style="position:relative;">${buildCover(b)}${b.vol?`<div class="vol-badge">${b.vol}</div>`:''}</div>
      <div class="book-card-body">
        <div class="book-card-title">${b.title}</div>
        <div class="book-card-meta">${b.genre}${b.vol?' · '+b.vol:''}</div>
        ${b.available?`<div class="book-card-price">${b.price}</div>`:`<div class="book-card-coming en">${b.release||'Coming Soon'}</div><div class="book-card-coming fr">${b.release||'À Venir'}</div><div class="book-card-coming es">${b.release||'Próximamente'}</div>`}
      </div>
    </div>`;
  }).join('');
  showPage('series-detail');
}

function goCatalog(){ showPage('home'); setTimeout(()=>document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'}),80); }
function goAbout(){ showPage('home'); setTimeout(()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'}),80); }

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LANGUAGE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function setLang(l){
  if(window.__sotrSetLang){window.__sotrSetLang(l);return;}
  document.body.setAttribute('data-lang',l);
  localStorage.setItem('sotr-lang',l);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  const _idx=['en','fr','es'].indexOf(l);
  document.querySelectorAll('.lang-btn').forEach((b,i)=>b.classList.toggle('active',i===_idx));
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SEARCH
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function openSearch(){ document.getElementById('search-overlay').classList.add('open'); document.getElementById('si-input').focus(); document.body.style.overflow='hidden'; }
function closeSearch(){ document.getElementById('search-overlay').classList.remove('open'); document.body.style.overflow=''; document.getElementById('si-input').value=''; document.getElementById('search-results').innerHTML=''; }
function closeSBg(e){ if(e.target===document.getElementById('search-overlay')) closeSearch(); }
function doSearch(){
  const q=document.getElementById('si-input').value.toLowerCase();
  const out=document.getElementById('search-results');
  if(q.length<2){ out.innerHTML=''; return; }
  const matches=Object.values(BOOKS).filter(b=>b.title.toLowerCase().includes(q)||b.genre.toLowerCase().includes(q)||b.series.toLowerCase().includes(q)||b.subtitle.toLowerCase().includes(q));
  if(!matches.length){ out.innerHTML=`<p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="en">No titles found for "${q}"</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="fr">Aucun titre trouvé pour « ${q} »</p><p style="font-family:var(--body);font-style:italic;color:var(--text-muted);padding:1rem 0;" class="es">No se encontraron títulos para "${q}"</p>`; return; }
  out.innerHTML=matches.map(b=>`<div class="sr-item" onclick="closeSearch();openBook('${b.key}')"><div class="sr-title">${b.title}</div><div class="sr-meta">${b.genre} · ${b.series} · ${b.lang}</div></div>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FOOTER CATALOG LINKS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function renderFooterLinks(){
  const keys=['mercer1','mercer7','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1'];
  document.getElementById('footer-catalog-links').innerHTML = keys.map(k=>`<li><a onclick="openBook('${k}')">${BOOKS[k].title.replace(/ - Book \d/,'').replace(/ Vol\. \d/,'')}</a></li>`).join('');
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NEWSLETTER
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function handleNL(){
  const v=document.getElementById('nl-input').value;
  if(!v||!v.includes('@'))return;
  document.getElementById('nl-input').style.display='none';
  document.querySelector('.nl-submit').style.display='none';
  document.getElementById('nl-confirm').style.display='block';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KEYBOARD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ closeModal(); closeSearch(); }
  if(e.key==='k'&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); openSearch(); }
});
// Also allow Enter on card keyboard navigation
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.hasAttribute('onclick')){
    e.target.click();
  }
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INIT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
renderHeroMosaic();
renderHomeCatalog();
renderHomeSeriesGrid();
renderBBPreviews();
renderSeriesListPage();
renderBundles('all');
renderFooterLinks();
tickTimers();

