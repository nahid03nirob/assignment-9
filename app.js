const STORAGE_KEY = "ideavault_state_v4";
const SESSION_KEY = "ideavault_session_v4";

const categories = ["Tech", "Health", "AI", "Education", "FinTech", "Climate", "Food", "Social Impact"];
const images = ["img/1.avif", "img/2.avif", "img/3.avif", "img/4.avif", "img/5.avif", "img/6.avif"];

const icons = {
  vault: "IV",
  menu: "Menu",
  close: "x",
  x: "X"
};

const protectedRoutes = ["#/add-idea", "#/my-ideas", "#/my-interactions", "#/profile"];
let pendingRoute = "#/";
let slideIndex = 0;
let sliderTimer = null;
let activeModal = null;

const defaultUsers = [
  {
    id: "user-demo",
    name: "Demo Founder",
    email: "demo@ideavault.dev",
    password: "DemoPass",
    photo: images[0]
  }
];

const defaultIdeas = [
  makeSeedIdea(
    "Carbon Lens for Small Retailers",
    "Climate",
    "A lightweight emissions tracker for small shops.",
    "Carbon Lens estimates carbon impact from utility bills, receipts, and inventory data, then gives practical reduction tasks that a small retailer can complete without hiring a sustainability team.",
    "Independent retailers",
    "Carbon reporting tools are costly and difficult for neighborhood businesses.",
    "Receipt parsing, utility imports, and simple recommendations ranked by cost impact.",
    18000,
    ["climate", "analytics"],
    images[0],
    36,
    "2026-06-01T10:00:00.000Z"
  ),
  makeSeedIdea(
    "AI Mentor Booth",
    "AI",
    "Voice-first interview and skill practice kiosks.",
    "Community centers can install AI Mentor Booths so adult learners can practice interviews, improve resumes, and get guided digital skill coaching in a low-pressure setting.",
    "Community education programs",
    "Adult learners need repeated practice outside class hours.",
    "Conversational AI, rubric-based feedback, and printable next steps.",
    42000,
    ["education", "voice-ai"],
    images[1],
    31,
    "2026-06-04T11:30:00.000Z"
  ),
  makeSeedIdea(
    "MediLoop Check-ins",
    "Health",
    "Post-visit follow-up that catches confusion early.",
    "MediLoop sends short mobile check-ins after appointments and flags unclear medication instructions, worsening symptoms, and missed follow-ups for care teams.",
    "Clinics and discharge teams",
    "Patients often leave visits overwhelmed and unsure what to do next.",
    "Plain-language prompts, risk scoring, and nurse-friendly queues.",
    65000,
    ["health", "patient-care"],
    images[2],
    28,
    "2026-06-07T09:15:00.000Z"
  ),
  makeSeedIdea(
    "SkillSwap Campus",
    "Education",
    "A barter marketplace for student micro-lessons.",
    "Students earn credits by teaching what they know and spend those credits on short peer lessons in design, coding, writing, and career preparation.",
    "University students",
    "Many students need affordable help while peers have useful skills to share.",
    "Reputation-based credits, moderated learning circles, and verified campus profiles.",
    9000,
    ["campus", "marketplace"],
    images[3],
    24,
    "2026-06-09T14:45:00.000Z"
  ),
  makeSeedIdea(
    "LocalPay Float",
    "FinTech",
    "Cash-flow warnings for microbusiness owners.",
    "LocalPay Float connects invoices, sales, and recurring expenses, then warns owners before tight weeks arrive so they can choose safer payment timing.",
    "Microbusiness owners",
    "Small operators make payment decisions without enough forward visibility.",
    "Forecasting, invoice reminders, and scenario planning in plain language.",
    35000,
    ["finance", "smb"],
    images[4],
    21,
    "2026-06-11T16:20:00.000Z"
  ),
  makeSeedIdea(
    "WasteLess Kitchen",
    "Food",
    "Restaurant prep assistant for reducing waste.",
    "The tool tracks ingredient waste from quick end-of-shift inputs and recommends order adjustments or specials to reduce spoilage and protect margins.",
    "Small restaurants",
    "Food waste quietly reduces profit and makes sustainability goals harder.",
    "Waste logging, trend alerts, and weekly purchasing suggestions.",
    22000,
    ["food", "operations"],
    images[5],
    18,
    "2026-06-13T12:10:00.000Z"
  )
];

const defaultComments = [
  {
    id: uid(),
    ideaId: "idea-1",
    userId: "user-demo",
    userName: "Demo Founder",
    text: "The retailer reporting angle makes this easier to sell than a generic dashboard.",
    createdAt: "2026-06-15T08:00:00.000Z"
  },
  {
    id: uid(),
    ideaId: "idea-2",
    userId: "user-demo",
    userName: "Demo Founder",
    text: "This could work beautifully with libraries and job centers.",
    createdAt: "2026-06-16T08:00:00.000Z"
  }
];

let state = loadState();
let currentUser = getCurrentUser();

window.addEventListener("hashchange", render);
document.addEventListener("click", handleClick);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);

if (!location.hash) {
  location.hash = "#/";
} else {
  render();
}

function makeSeedIdea(title, category, shortDescription, detailedDescription, targetAudience, problemStatement, proposedSolution, budget, tags, image, likes, createdAt) {
  const id = `idea-${defaultIdeasLength() + 1}`;
  return {
    id,
    ownerId: "user-demo",
    ownerName: "Demo Founder",
    title,
    category,
    shortDescription,
    detailedDescription,
    targetAudience,
    problemStatement,
    proposedSolution,
    budget,
    tags,
    image,
    likes,
    createdAt
  };
}

function defaultIdeasLength() {
  if (!defaultIdeasLength.count) defaultIdeasLength.count = 0;
  defaultIdeasLength.count += 1;
  return defaultIdeasLength.count - 1;
}

function defaultState() {
  return {
    theme: "light",
    users: defaultUsers,
    ideas: defaultIdeas,
    comments: defaultComments,
    bookmarks: []
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.ideas) && Array.isArray(saved.users)) {
      return {
        theme: saved.theme === "dark" ? "dark" : "light",
        users: saved.users,
        ideas: saved.ideas.map(normalizeSavedIdea),
        comments: Array.isArray(saved.comments) ? saved.comments : [],
        bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : []
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return defaultState();
}

function normalizeSavedIdea(idea, index) {
  return {
    id: idea.id || uid(),
    ownerId: idea.ownerId || "user-demo",
    ownerName: idea.ownerName || "Demo Founder",
    title: idea.title || "Untitled startup idea",
    category: categories.includes(idea.category) ? idea.category : "Tech",
    shortDescription: idea.shortDescription || idea.summary || "A startup concept ready for feedback.",
    detailedDescription: idea.detailedDescription || idea.summary || "This idea needs more details from the founder.",
    targetAudience: idea.targetAudience || "Early adopters",
    problemStatement: idea.problemStatement || "The problem statement has not been refined yet.",
    proposedSolution: idea.proposedSolution || "The solution needs more validation and community feedback.",
    budget: idea.budget || "",
    tags: Array.isArray(idea.tags) ? idea.tags : [],
    image: idea.image || images[index % images.length],
    likes: Number(idea.likes || 0),
    createdAt: idea.createdAt || new Date().toISOString()
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    return state.users.find((user) => user.id === parsed.userId) || null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function setSession(user) {
  const token = btoa(`${user.id}:${Date.now()}:ideavault`);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, token }));
  currentUser = user;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
}

function route() {
  return location.hash || "#/";
}

function navigate(hash) {
  if (location.hash === hash) {
    render();
  } else {
    location.hash = hash;
  }
}

function render() {
  const app = document.getElementById("app");
  const hash = route();
  const privateRoute = protectedRoutes.some((item) => hash.startsWith(item)) || /^#\/ideas\/.+/.test(hash);

  if (privateRoute && !currentUser) {
    pendingRoute = hash;
    showToast("Please login to continue.", "error");
    navigate("#/login");
    return;
  }

  document.documentElement.classList.toggle("dark", state.theme === "dark");
  app.innerHTML = appShell(viewForRoute(hash));
  updateTitle(hash);
  afterRender(hash);
}

function viewForRoute(hash) {
  if (hash === "#/") return homeView();
  if (hash === "#/ideas") return ideasView();
  if (hash === "#/add-idea") return ideaFormView();
  if (hash === "#/my-ideas") return myIdeasView();
  if (hash === "#/my-interactions") return interactionsView();
  if (hash === "#/login") return loginView();
  if (hash === "#/register") return registerView();
  if (hash === "#/profile") return profileView();
  if (hash.startsWith("#/ideas/")) return ideaDetailsView(hash.replace("#/ideas/", ""));
  return notFoundView();
}

function appShell(content) {
  return `
    <div class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      ${navbar()}
      <main>${content}</main>
      ${footer()}
      ${activeModal ? modalView(activeModal) : ""}
    </div>
  `;
}

function navbar() {
  const navLink = (href, label, privateLabel = false) => {
    if (privateLabel && !currentUser) return "";
    const active = route() === href || (href === "#/ideas" && route().startsWith("#/ideas/"));
    return `<a class="${active ? "bg-slate-100 dark:bg-slate-800" : ""} rounded-vault px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800" href="${href}">${label}</a>`;
  };

  return `
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <nav class="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#/" class="flex items-center gap-2 text-lg font-black">
          <span class="grid h-10 w-10 place-items-center rounded-vault bg-teal-600 text-white">${icons.vault}</span>
          <span>IdeaVault</span>
        </a>
        <button class="rounded-vault border border-slate-300 px-3 py-2 text-sm font-bold lg:hidden dark:border-slate-700" data-action="toggle-menu">${icons.menu}</button>
        <div id="nav-menu" class="absolute left-4 right-4 top-[74px] hidden flex-col gap-2 rounded-vault border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:static lg:flex lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent">
          ${navLink("#/", "Home")}
          ${navLink("#/ideas", "Ideas")}
          ${navLink("#/add-idea", "Add Idea", true)}
          ${navLink("#/my-ideas", "My Ideas", true)}
          ${navLink("#/my-interactions", "My Interactions", true)}
        </div>
        <div class="flex items-center gap-2">
          <button class="rounded-vault border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" data-action="theme">${state.theme === "dark" ? "Light" : "Dark"}</button>
          ${currentUser ? profileMenu() : `<a class="rounded-vault bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700" href="#/login">Login/Register</a>`}
        </div>
      </nav>
    </header>
  `;
}

function profileMenu() {
  return `
    <div class="relative">
      <button class="flex items-center gap-2 rounded-vault border border-slate-300 px-2 py-1.5 text-sm font-bold dark:border-slate-700" data-action="profile-menu">
        <img class="h-8 w-8 rounded-full object-cover" src="${escapeHtml(currentUser.photo)}" alt="${escapeHtml(currentUser.name)}" />
        <span class="hidden sm:inline">${escapeHtml(currentUser.name)}</span>
      </button>
      <div id="profile-dropdown" class="absolute right-0 top-12 hidden w-64 rounded-vault border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm font-bold">${escapeHtml(currentUser.name)}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(currentUser.email)}</p>
        <a class="mt-3 block rounded-vault px-3 py-2 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800" href="#/profile">Profile Management</a>
        <button class="block w-full rounded-vault px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950" data-action="logout">Logout</button>
      </div>
    </div>
  `;
}

function footer() {
  return `
    <footer class="mt-10 border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 class="text-xl font-black">IdeaVault</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">A community platform for sharing, validating, and improving startup ideas.</p>
        </div>
        <div>
          <h3 class="font-bold">Platform</h3>
          <a class="mt-2 block text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400" href="#/ideas">Ideas</a>
          <a class="mt-2 block text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400" href="#/add-idea">Add Idea</a>
          <a class="mt-2 block text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400" href="#/my-interactions">Discussions</a>
        </div>
        <div>
          <h3 class="font-bold">Contact</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">hello@ideavault.dev</p>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Dhaka, Bangladesh</p>
        </div>
        <div>
          <h3 class="font-bold">Social</h3>
          <a class="mt-2 block text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400" href="#">${icons.x} / IdeaVault</a>
          <a class="mt-2 block text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400" href="#">LinkedIn</a>
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">Copyright ${new Date().getFullYear()} IdeaVault.</p>
        </div>
      </div>
    </footer>
  `;
}

function homeView() {
  const trending = [...state.ideas].sort((a, b) => trendScore(b) - trendScore(a)).slice(0, 6);
  return `
    <section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="relative min-h-[430px] overflow-hidden rounded-vault bg-slate-950 text-white shadow-xl">
        ${heroSlide(0, "Validate Startup Ideas Faster", "Share concepts, collect feedback, and discover what the community is ready to support.", images[0])}
        ${heroSlide(1, "Build With Better Signals", "Use comments, bookmarks, and discussions to refine your startup before launch.", images[1])}
        ${heroSlide(2, "Find Collaborators Early", "Explore promising ideas from founders, makers, students, and early adopters.", images[2])}
        <div class="absolute bottom-5 left-6 flex gap-2">${[0, 1, 2].map((i) => `<button class="h-2.5 w-8 rounded-full bg-white/40" data-action="slide" data-index="${i}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      ${sectionHeading("Trending Ideas", "Six ideas ranked by likes, comments, and recent activity.", "#/ideas")}
      ${ideaGrid(trending)}
    </section>

    <section class="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      ${featureCard("Community Validation", "Collect comments from people who understand the target audience.")}
      ${featureCard("Founder Dashboard", "Manage your ideas, updates, and discussions from private pages.")}
      ${featureCard("Smart Discovery", "Search by title and filter by category or date range.")}
    </section>

    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-4 rounded-vault border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        ${statCard(state.ideas.length, "Ideas shared")}
        ${statCard(state.comments.length, "Comments posted")}
        ${statCard(state.bookmarks.length, "Bookmarks")}
        ${statCard(categories.length, "Categories")}
      </div>
    </section>
  `;
}

function heroSlide(index, title, text, image) {
  return `
    <article class="slide absolute inset-0 grid items-center bg-cover bg-center p-7 opacity-0 transition-opacity duration-500 sm:p-12" style="background-image: linear-gradient(90deg, rgba(15,23,42,.9), rgba(15,23,42,.45)), url('${image}')">
      <div class="max-w-2xl">
        <p class="text-sm font-bold uppercase text-teal-300">Startup Innovation</p>
        <h1 class="mt-3 text-4xl font-black leading-tight sm:text-5xl">${title}</h1>
        <p class="mt-4 text-lg leading-8 text-slate-200">${text}</p>
        <a class="mt-6 inline-flex rounded-vault bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700" href="#/ideas">Explore Ideas</a>
      </div>
    </article>
  `;
}

function sectionHeading(title, text, link) {
  return `
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-2xl font-black">${title}</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${text}</p>
      </div>
      <a class="rounded-vault border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" href="${link}">View All</a>
    </div>
  `;
}

function featureCard(title, text) {
  return `
    <article class="rounded-vault border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 class="text-lg font-black">${title}</h3>
      <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">${text}</p>
    </article>
  `;
}

function statCard(value, label) {
  return `<article><strong class="text-3xl font-black text-teal-600">${value}</strong><p class="text-sm text-slate-500 dark:text-slate-400">${label}</p></article>`;
}

function ideasView() {
  return `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-5">
        <h1 class="text-3xl font-black">Explore Ideas</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Search title, filter category, and review community validation signals.</p>
      </div>
      <div class="mb-5 grid gap-3 rounded-vault border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_180px_160px_160px]">
        <input id="search-input" class="rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Search by idea title" />
        <select id="category-filter" class="rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          <option value="">All categories</option>
          ${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}
        </select>
        <input id="from-date" type="date" class="rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        <input id="to-date" type="date" class="rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
      </div>
      <div id="ideas-result">${ideaGrid(state.ideas)}</div>
    </section>
  `;
}

function ideaDetailsView(id) {
  const idea = state.ideas.find((item) => item.id === id);
  if (!idea) return notFoundView("Idea not found", "The idea you opened does not exist.");
  const comments = state.comments.filter((comment) => comment.ideaId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return `
    <section class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <article class="overflow-hidden rounded-vault border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <img class="h-72 w-full object-cover" src="${escapeHtml(idea.image)}" alt="${escapeHtml(idea.title)}" />
        <div class="p-5">
          <div class="flex flex-wrap gap-2">${pill(idea.category)}${pill(formatDate(idea.createdAt))}${pill(`${idea.likes} likes`)}</div>
          <h1 class="mt-4 text-3xl font-black">${escapeHtml(idea.title)}</h1>
          <p class="mt-3 leading-7 text-slate-600 dark:text-slate-300">${escapeHtml(idea.detailedDescription)}</p>
          <div class="mt-6 grid gap-4 md:grid-cols-2">
            ${infoBlock("Target Audience", idea.targetAudience)}
            ${infoBlock("Estimated Budget", idea.budget ? `$${Number(idea.budget).toLocaleString()}` : "Open for discussion")}
            ${infoBlock("Problem Statement", idea.problemStatement)}
            ${infoBlock("Proposed Solution", idea.proposedSolution)}
          </div>
          <div class="mt-5 flex flex-wrap gap-2">${idea.tags.map((tag) => pill(`#${tag}`)).join("")}</div>
          <p class="mt-5 text-sm text-slate-500 dark:text-slate-400">Posted by ${escapeHtml(idea.ownerName)}</p>
        </div>
      </article>
      <aside class="rounded-vault border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-xl font-black">Discussion</h2>
        <form id="comment-form" data-idea-id="${idea.id}" class="mt-4">
          <label class="text-sm font-bold" for="comment-text">Add comment</label>
          <textarea id="comment-text" name="text" required class="mt-2 h-28 w-full resize-none rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Share feedback or validation signals"></textarea>
          <button class="mt-3 rounded-vault bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700" type="submit">Comment</button>
        </form>
        <div class="mt-5 space-y-3">${comments.length ? comments.map(commentView).join("") : emptyState("No comments yet.", "Start the discussion with useful feedback.")}</div>
      </aside>
    </section>
  `;
}

function infoBlock(title, text) {
  return `<div class="rounded-vault bg-slate-100 p-4 dark:bg-slate-800"><h3 class="font-bold">${title}</h3><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">${escapeHtml(text)}</p></div>`;
}

function ideaFormView(idea = null) {
  const edit = Boolean(idea);
  return `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-5">
        <h1 class="text-3xl font-black">${edit ? "Update Idea" : "Add Startup Idea"}</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Describe the opportunity clearly so the community can validate it.</p>
      </div>
      <form id="${edit ? "update-idea-form" : "add-idea-form"}" data-id="${edit ? idea.id : ""}" class="grid gap-4 rounded-vault border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        ${field("Idea Title", "title", "text", idea?.title, true)}
        <div>${label("category", "Category")}<select id="category" name="category" required class="input">${categories.map((category) => `<option ${idea?.category === category ? "selected" : ""}>${category}</option>`).join("")}</select></div>
        ${field("Short Description", "shortDescription", "text", idea?.shortDescription, true)}
        ${field("ImageURL", "image", "url", idea?.image || images[0], true)}
        ${textarea("Detailed Description", "detailedDescription", idea?.detailedDescription, true, "md:col-span-2")}
        ${field("Tags", "tags", "text", idea?.tags?.join(", "), false, "Optional: ai, campus, health")}
        ${field("Estimated Budget", "budget", "number", idea?.budget, false, "Optional")}
        ${field("Target Audience", "targetAudience", "text", idea?.targetAudience, true)}
        ${textarea("Problem Statement", "problemStatement", idea?.problemStatement, true)}
        ${textarea("Proposed Solution", "proposedSolution", idea?.proposedSolution, true)}
        <div class="md:col-span-2">
          <button class="rounded-vault bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700" type="submit">${edit ? "Save Changes" : "Submit Idea"}</button>
        </div>
      </form>
    </section>
  `;
}

function myIdeasView() {
  const mine = state.ideas.filter((idea) => idea.ownerId === currentUser.id);
  return `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-black">My Ideas</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Update or delete startup ideas you posted.</p>
      <div class="mt-5">${mine.length ? ideaGrid(mine, true) : emptyState("No ideas yet.", "Add your first startup concept to collect feedback.")}</div>
    </section>
  `;
}

function interactionsView() {
  const mine = state.comments.filter((comment) => comment.userId === currentUser.id);
  const items = mine.map((comment) => ({ comment, idea: state.ideas.find((idea) => idea.id === comment.ideaId) })).filter((item) => item.idea);
  return `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-black">My Interactions</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Ideas where you joined the discussion.</p>
      <div class="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${items.length ? items.map(({ comment, idea }) => interactionCard(idea, comment)).join("") : emptyState("No interactions yet.", "Comment on an idea and it will appear here.")}
      </div>
    </section>
  `;
}

function interactionCard(idea, comment) {
  return `
    <article class="rounded-vault border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 class="font-black">${escapeHtml(idea.title)}</h3>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Your comment: ${escapeHtml(comment.text)}</p>
      <a class="mt-4 inline-flex rounded-vault bg-teal-600 px-4 py-2 text-sm font-bold text-white" href="#/ideas/${idea.id}">View Discussion</a>
    </article>
  `;
}

function loginView() {
  return `
    <section class="mx-auto max-w-md px-4 py-10">
      <form id="login-form" class="rounded-vault border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 class="text-3xl font-black">Login</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Demo: demo@ideavault.dev / DemoPass</p>
        ${field("Email", "email", "email", "", true)}
        ${field("Password", "password", "password", "", true)}
        <a class="mt-3 block text-sm font-bold text-teal-600" href="#">Forget Password?</a>
        <button class="mt-4 w-full rounded-vault bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700" type="submit">Login</button>
        <button class="mt-3 w-full rounded-vault border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" type="button" data-action="google-login">Google Login</button>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">New here? <a class="font-bold text-teal-600" href="#/register">Create an account</a></p>
      </form>
    </section>
  `;
}

function registerView() {
  return `
    <section class="mx-auto max-w-md px-4 py-10">
      <form id="register-form" class="rounded-vault border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 class="text-3xl font-black">Register</h1>
        ${field("Name", "name", "text", "", true)}
        ${field("Email", "email", "email", "", true)}
        ${field("Photo URL", "photo", "url", images[0], true)}
        ${field("Password", "password", "password", "", true)}
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Password must be at least 6 characters and include uppercase and lowercase letters.</p>
        <button class="mt-4 w-full rounded-vault bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700" type="submit">Register</button>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">Already have an account? <a class="font-bold text-teal-600" href="#/login">Log in</a></p>
      </form>
    </section>
  `;
}

function profileView() {
  return `
    <section class="mx-auto max-w-md px-4 py-10">
      <form id="profile-form" class="rounded-vault border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 class="text-3xl font-black">Profile Management</h1>
        <img class="mt-4 h-24 w-24 rounded-full object-cover" src="${escapeHtml(currentUser.photo)}" alt="${escapeHtml(currentUser.name)}" />
        ${field("Name", "name", "text", currentUser.name, true)}
        ${field("Photo URL", "photo", "url", currentUser.photo, true)}
        <button class="mt-4 w-full rounded-vault bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700" type="submit">Update Profile</button>
      </form>
    </section>
  `;
}

function notFoundView(title = "404 - Page Not Found", text = "The route you opened does not exist.") {
  return `
    <section class="mx-auto max-w-3xl px-4 py-16 text-center">
      ${emptyState(title, text)}
      <a class="mt-5 inline-flex rounded-vault bg-teal-600 px-5 py-3 font-bold text-white" href="#/">Back Home</a>
    </section>
  `;
}

function ideaGrid(ideas, ownerTools = false) {
  if (!ideas.length) return emptyState("No ideas found.", "Try a different search or category filter.");
  return `<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">${ideas.map((idea) => ideaCard(idea, ownerTools)).join("")}</div>`;
}

function ideaCard(idea, ownerTools = false) {
  const commentCount = state.comments.filter((comment) => comment.ideaId === idea.id).length;
  const bookmarked = currentUser && state.bookmarks.some((bookmark) => bookmark.ideaId === idea.id && bookmark.userId === currentUser.id);
  return `
    <article class="flex h-full flex-col overflow-hidden rounded-vault border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <img class="h-44 w-full object-cover" src="${escapeHtml(idea.image)}" alt="${escapeHtml(idea.title)}" />
      <div class="flex flex-1 flex-col p-5">
        <div class="flex flex-wrap gap-2">${pill(idea.category)}${pill(formatDate(idea.createdAt))}</div>
        <h3 class="mt-3 text-lg font-black">${escapeHtml(idea.title)}</h3>
        <p class="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">${escapeHtml(idea.shortDescription)}</p>
        <div class="mt-4 flex flex-wrap gap-2">${pill(`${idea.likes} likes`)}${pill(`${commentCount} comments`)}${pill(idea.budget ? `$${Number(idea.budget).toLocaleString()}` : "Budget open")}</div>
        <div class="mt-4 flex flex-wrap gap-2">
          <a class="rounded-vault bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700" href="#/ideas/${idea.id}">View Details</a>
          <button class="rounded-vault border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" data-action="bookmark" data-id="${idea.id}">${bookmarked ? "Bookmarked" : "Bookmark"}</button>
          ${ownerTools ? `<button class="rounded-vault border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" data-action="edit-idea" data-id="${idea.id}">Update</button><button class="rounded-vault bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700" data-action="delete-idea" data-id="${idea.id}">Delete</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function commentView(comment) {
  const mine = currentUser && comment.userId === currentUser.id;
  return `
    <article class="rounded-vault bg-slate-100 p-4 dark:bg-slate-800">
      <div class="flex items-center justify-between gap-3">
        <strong class="text-sm">${escapeHtml(comment.userName)}</strong>
        <span class="text-xs text-slate-500 dark:text-slate-400">${formatDate(comment.createdAt)}</span>
      </div>
      <p class="mt-2 text-sm leading-6">${escapeHtml(comment.text)}</p>
      ${mine ? `<div class="mt-3 flex gap-2"><button class="rounded-vault border border-slate-300 px-3 py-1.5 text-xs font-bold dark:border-slate-700" data-action="edit-comment" data-id="${comment.id}">Edit</button><button class="rounded-vault bg-red-600 px-3 py-1.5 text-xs font-bold text-white" data-action="delete-comment" data-id="${comment.id}">Delete</button></div>` : ""}
    </article>
  `;
}

function field(labelText, name, type, value = "", required = false, placeholder = "") {
  return `<div class="mt-4">${label(name, labelText)}<input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value || "")}" ${required ? "required" : ""} placeholder="${escapeHtml(placeholder)}" class="input" /></div>`;
}

function textarea(labelText, name, value = "", required = false, extraClass = "") {
  return `<div class="mt-4 ${extraClass}">${label(name, labelText)}<textarea id="${name}" name="${name}" ${required ? "required" : ""} class="input h-28 resize-none">${escapeHtml(value || "")}</textarea></div>`;
}

function label(name, text) {
  return `<label class="block text-sm font-bold" for="${name}">${text}</label>`;
}

function pill(text) {
  return `<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">${escapeHtml(text)}</span>`;
}

function emptyState(title, text) {
  return `<div class="rounded-vault border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"><h2 class="text-xl font-black">${escapeHtml(title)}</h2><p class="mt-2 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(text)}</p></div>`;
}

function afterRender(hash) {
  document.querySelectorAll(".input").forEach((input) => {
    input.classList.add("mt-2", "w-full", "rounded-vault", "border", "border-slate-300", "bg-white", "px-3", "py-2", "text-sm", "outline-none", "focus:border-teal-600", "dark:border-slate-700", "dark:bg-slate-950");
  });

  if (hash === "#/") {
    startSlider();
  } else {
    clearInterval(sliderTimer);
  }
}

function startSlider() {
  clearInterval(sliderTimer);
  setSlide(slideIndex);
  sliderTimer = setInterval(() => setSlide((slideIndex + 1) % 3), 4500);
}

function setSlide(index) {
  slideIndex = index;
  document.querySelectorAll(".slide").forEach((slide, i) => {
    slide.classList.toggle("opacity-100", i === index);
    slide.classList.toggle("opacity-0", i !== index);
  });
  document.querySelectorAll("[data-action='slide']").forEach((dot, i) => {
    dot.classList.toggle("bg-white", i === index);
    dot.classList.toggle("bg-white/40", i !== index);
  });
}

function handleClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "toggle-menu") document.getElementById("nav-menu")?.classList.toggle("hidden");
  if (action === "profile-menu") document.getElementById("profile-dropdown")?.classList.toggle("hidden");
  if (action === "theme") toggleTheme();
  if (action === "logout") logout();
  if (action === "google-login") googleLogin();
  if (action === "slide") setSlide(Number(button.dataset.index));
  if (action === "bookmark") bookmarkIdea(button.dataset.id);
  if (action === "edit-idea") openEditIdea(button.dataset.id);
  if (action === "delete-idea") openDeleteIdea(button.dataset.id);
  if (action === "edit-comment") openEditComment(button.dataset.id);
  if (action === "delete-comment") openDeleteComment(button.dataset.id);
  if (action === "close-modal") closeModal();
  if (action === "confirm-delete-idea") deleteIdea(button.dataset.id);
  if (action === "confirm-delete-comment") deleteComment(button.dataset.id);
}

function handleSubmit(event) {
  const form = event.target;
  if (!form.id) return;
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  if (form.id === "login-form") login(data);
  if (form.id === "register-form") register(data);
  if (form.id === "add-idea-form") addIdea(data);
  if (form.id === "update-idea-form") updateIdea(form.dataset.id, data);
  if (form.id === "comment-form") addComment(form.dataset.ideaId, data.text);
  if (form.id === "profile-form") updateProfile(data);
  if (form.id === "edit-comment-form") updateComment(form.dataset.id, data.text);
}

function handleInput(event) {
  if (["search-input", "category-filter", "from-date", "to-date"].includes(event.target.id)) {
    filterIdeas();
  }
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveState();
  render();
}

function login(data) {
  const user = state.users.find((item) => item.email.toLowerCase() === data.email.toLowerCase() && item.password === data.password);
  if (!user) {
    showToast("Invalid email or password.", "error");
    return;
  }

  setSession(user);
  showToast("Login successful.", "success");
  navigate(pendingRoute || "#/");
}

function googleLogin() {
  let user = state.users.find((item) => item.email === "google.founder@ideavault.dev");
  if (!user) {
    user = {
      id: uid(),
      name: "Google Founder",
      email: "google.founder@ideavault.dev",
      password: "GooglePass",
      photo: images[1]
    };
    state.users.push(user);
    saveState();
  }

  setSession(user);
  showToast("Google login successful.", "success");
  navigate(pendingRoute || "#/");
}

function register(data) {
  if (state.users.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) {
    showToast("Email already exists.", "error");
    return;
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(data.password)) {
    showToast("Password needs 6 characters with uppercase and lowercase letters.", "error");
    return;
  }

  const user = {
    id: uid(),
    name: data.name.trim(),
    email: data.email.trim(),
    photo: data.photo.trim(),
    password: data.password
  };
  state.users.push(user);
  saveState();
  setSession(user);
  showToast("Registration successful.", "success");
  navigate(pendingRoute || "#/");
}

function logout() {
  clearSession();
  showToast("Logged out successfully.", "success");
  navigate("#/");
}

function addIdea(data) {
  state.ideas.unshift(normalizeIdea(data, true));
  saveState();
  showToast("Idea submitted successfully.", "success");
  navigate("#/my-ideas");
}

function updateIdea(id, data) {
  const index = state.ideas.findIndex((idea) => idea.id === id && idea.ownerId === currentUser.id);
  if (index < 0) {
    showToast("You can only update your own ideas.", "error");
    return;
  }

  state.ideas[index] = { ...state.ideas[index], ...normalizeIdea(data, false) };
  saveState();
  closeModal();
  showToast("Idea updated successfully.", "success");
  render();
}

function normalizeIdea(data, isNew) {
  return {
    ...(isNew ? { id: uid(), ownerId: currentUser.id, ownerName: currentUser.name, likes: 0, createdAt: new Date().toISOString() } : {}),
    title: data.title.trim(),
    category: data.category,
    shortDescription: data.shortDescription.trim(),
    detailedDescription: data.detailedDescription.trim(),
    targetAudience: data.targetAudience.trim(),
    problemStatement: data.problemStatement.trim(),
    proposedSolution: data.proposedSolution.trim(),
    budget: data.budget ? Number(data.budget) : "",
    tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    image: data.image.trim()
  };
}

function addComment(ideaId, text) {
  state.comments.unshift({
    id: uid(),
    ideaId,
    userId: currentUser.id,
    userName: currentUser.name,
    text: text.trim(),
    createdAt: new Date().toISOString()
  });
  saveState();
  showToast("Comment added.", "success");
  render();
}

function updateComment(id, text) {
  const comment = state.comments.find((item) => item.id === id && item.userId === currentUser.id);
  if (!comment) {
    showToast("You can only edit your own comments.", "error");
    return;
  }

  comment.text = text.trim();
  comment.createdAt = new Date().toISOString();
  saveState();
  closeModal();
  showToast("Comment updated.", "success");
  render();
}

function deleteComment(id) {
  state.comments = state.comments.filter((comment) => !(comment.id === id && comment.userId === currentUser.id));
  saveState();
  closeModal();
  showToast("Comment deleted.", "success");
  render();
}

function deleteIdea(id) {
  state.ideas = state.ideas.filter((idea) => !(idea.id === id && idea.ownerId === currentUser.id));
  state.comments = state.comments.filter((comment) => comment.ideaId !== id);
  state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.ideaId !== id);
  saveState();
  closeModal();
  showToast("Idea deleted.", "success");
  navigate("#/my-ideas");
}

function updateProfile(data) {
  const user = state.users.find((item) => item.id === currentUser.id);
  user.name = data.name.trim();
  user.photo = data.photo.trim();

  state.ideas.forEach((idea) => {
    if (idea.ownerId === user.id) idea.ownerName = user.name;
  });
  state.comments.forEach((comment) => {
    if (comment.userId === user.id) comment.userName = user.name;
  });

  currentUser = user;
  saveState();
  showToast("Profile updated successfully.", "success");
  render();
}

function bookmarkIdea(id) {
  if (!currentUser) {
    pendingRoute = route();
    showToast("Login to bookmark ideas.", "error");
    navigate("#/login");
    return;
  }

  const existing = state.bookmarks.find((bookmark) => bookmark.ideaId === id && bookmark.userId === currentUser.id);
  if (existing) {
    state.bookmarks = state.bookmarks.filter((bookmark) => bookmark !== existing);
    showToast("Bookmark removed.", "success");
  } else {
    state.bookmarks.push({ id: uid(), ideaId: id, userId: currentUser.id, createdAt: new Date().toISOString() });
    showToast("Idea bookmarked.", "success");
  }
  saveState();
  render();
}

function filterIdeas() {
  const search = document.getElementById("search-input")?.value.toLowerCase() || "";
  const category = document.getElementById("category-filter")?.value || "";
  const from = document.getElementById("from-date")?.value || "";
  const to = document.getElementById("to-date")?.value || "";

  const filtered = state.ideas.filter((idea) => {
    const day = idea.createdAt.slice(0, 10);
    return idea.title.toLowerCase().includes(search)
      && (!category || idea.category === category)
      && (!from || day >= from)
      && (!to || day <= to);
  });

  const result = document.getElementById("ideas-result");
  if (result) {
    result.innerHTML = ideaGrid(filtered);
  }
}

function openEditIdea(id) {
  const idea = state.ideas.find((item) => item.id === id && item.ownerId === currentUser.id);
  if (!idea) return;
  activeModal = { type: "idea", idea };
  render();
}

function openDeleteIdea(id) {
  activeModal = { type: "delete-idea", id };
  render();
}

function openEditComment(id) {
  const comment = state.comments.find((item) => item.id === id && item.userId === currentUser.id);
  if (!comment) return;
  activeModal = { type: "comment", comment };
  render();
}

function openDeleteComment(id) {
  activeModal = { type: "delete-comment", id };
  render();
}

function closeModal() {
  activeModal = null;
  render();
}

function modalView(modal) {
  if (modal.type === "idea") {
    return `<div class="fixed inset-0 z-40 overflow-y-auto bg-slate-950/70 p-4"><div class="mx-auto max-w-5xl rounded-vault bg-slate-50 p-2 dark:bg-slate-950"><button class="float-right m-2 rounded-vault border px-3 py-1 font-bold" data-action="close-modal">${icons.close}</button>${ideaFormView(modal.idea)}</div></div>`;
  }

  if (modal.type === "comment") {
    return `
      <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
        <form id="edit-comment-form" data-id="${modal.comment.id}" class="w-full max-w-md rounded-vault bg-white p-5 dark:bg-slate-900">
          <h2 class="text-xl font-black">Edit Comment</h2>
          <textarea name="text" required class="mt-3 h-32 w-full resize-none rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">${escapeHtml(modal.comment.text)}</textarea>
          <div class="mt-4 flex gap-2"><button class="rounded-vault bg-teal-600 px-4 py-2 text-sm font-bold text-white" type="submit">Save</button><button class="rounded-vault border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700" type="button" data-action="close-modal">Cancel</button></div>
        </form>
      </div>
    `;
  }

  const isIdea = modal.type === "delete-idea";
  return `
    <div class="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
      <div class="w-full max-w-sm rounded-vault bg-white p-5 dark:bg-slate-900">
        <h2 class="text-xl font-black">Delete ${isIdea ? "idea" : "comment"}?</h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
        <div class="mt-4 flex gap-2">
          <button class="rounded-vault bg-red-600 px-4 py-2 text-sm font-bold text-white" data-action="${isIdea ? "confirm-delete-idea" : "confirm-delete-comment"}" data-id="${modal.id}">Delete</button>
          <button class="rounded-vault border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700" data-action="close-modal">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function showToast(message, type = "success") {
  const root = document.getElementById("toast-root");
  const toast = document.createElement("div");
  toast.className = `mb-3 rounded-vault px-4 py-3 text-sm font-bold shadow-xl ${type === "error" ? "bg-red-600" : "bg-teal-600"} text-white`;
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateTitle(hash) {
  const labels = {
    "#/": "Home",
    "#/ideas": "Ideas",
    "#/add-idea": "Add Idea",
    "#/my-ideas": "My Ideas",
    "#/my-interactions": "My Interactions",
    "#/login": "Login",
    "#/register": "Register",
    "#/profile": "Profile"
  };
  document.title = `${labels[hash] || (hash.startsWith("#/ideas/") ? "Idea Details" : "404")} | IdeaVault`;
}

function trendScore(idea) {
  const comments = state.comments.filter((comment) => comment.ideaId === idea.id).length;
  const ageDays = Math.max(1, (Date.now() - new Date(idea.createdAt).getTime()) / 86400000);
  return idea.likes * 2 + comments * 5 + 10 / ageDays;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function uid() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}
