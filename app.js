const STORAGE_KEY = "ideavault_state_v1";

const categories = ["Tech", "Health", "AI", "Education", "FinTech", "Climate"];

const seedImages = [
  "img/1.avif",
  "img/2.avif",
  "img/3.avif",
  "img/4.avif",
  "img/5.avif",
  "img/6.avif"
];

const defaultIdeas = [
  {
    id: createId(),
    title: "AI Study Planner",
    category: "AI",
    summary: "Students can make smart study routines and track daily progress.",
    image: seedImages[0],
    saved: true
  },
  {
    id: createId(),
    title: "Health Reminder App",
    category: "Health",
    summary: "Reminds users about medicine, water intake, sleep, and appointments.",
    image: seedImages[1],
    saved: false
  },
  {
    id: createId(),
    title: "Online Learning Hub",
    category: "Education",
    summary: "A platform for short courses, notes, quizzes, and class materials.",
    image: seedImages[2],
    saved: false
  },
  {
    id: createId(),
    title: "Digital Wallet Tracker",
    category: "FinTech",
    summary: "Helps users track spending, savings, and monthly budgets.",
    image: seedImages[3],
    saved: false
  },
  {
    id: createId(),
    title: "Climate Action Board",
    category: "Climate",
    summary: "Local people can share recycling, tree planting, and cleanup tasks.",
    image: seedImages[4],
    saved: true
  },
  {
    id: createId(),
    title: "Startup Team Finder",
    category: "Tech",
    summary: "Connects founders, designers, developers, and marketers for projects.",
    image: seedImages[5],
    saved: false
  }
];

let state = loadState();

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `idea-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.ideas)) {
      return {
        ideas: saved.ideas.map((idea, index) => ({
          id: idea.id || createId(),
          title: idea.title || "Untitled idea",
          category: categories.includes(idea.category) ? idea.category : "Tech",
          summary: idea.summary || "No summary added yet.",
          image: idea.image || seedImages[index % seedImages.length],
          saved: Boolean(idea.saved)
        })),
        search: typeof saved.search === "string" ? saved.search : "",
        category: ["All", ...categories].includes(saved.category) ? saved.category : "All",
        darkMode: Boolean(saved.darkMode)
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    ideas: defaultIdeas,
    search: "",
    category: "All",
    darkMode: false
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(nextState) {
  state = { ...state, ...nextState };
  saveState();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredIdeas() {
  return state.ideas.filter((idea) => {
    const categoryMatch = state.category === "All" || idea.category === state.category;
    const searchText = `${idea.title} ${idea.category} ${idea.summary}`.toLowerCase();
    const searchMatch = searchText.includes(state.search.toLowerCase());
    return categoryMatch && searchMatch;
  });
}

function render() {
  const app = document.querySelector("#app");
  const ideas = getFilteredIdeas();
  const savedCount = state.ideas.filter((idea) => idea.saved).length;

  document.documentElement.classList.toggle("dark", state.darkMode);

  app.innerHTML = `
    <main class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header class="rounded-vault border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-bold uppercase text-teal-600 dark:text-teal-400">IdeaVault</p>
              <h1 class="mt-1 text-3xl font-extrabold sm:text-4xl">Startup idea organizer</h1>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Add, search, save, and manage startup ideas with images.
              </p>
            </div>
            <button id="theme-toggle" class="h-10 rounded-vault border border-slate-300 px-4 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              ${state.darkMode ? "Light" : "Dark"}
            </button>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <div class="rounded-vault bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Total ideas</p>
              <p class="mt-1 text-2xl font-bold">${state.ideas.length}</p>
            </div>
            <div class="rounded-vault bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Saved ideas</p>
              <p class="mt-1 text-2xl font-bold">${savedCount}</p>
            </div>
            <div class="rounded-vault bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Categories</p>
              <p class="mt-1 text-2xl font-bold">${categories.length}</p>
            </div>
          </div>
        </header>

        <section class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <form id="idea-form" class="rounded-vault border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 class="text-xl font-bold">Add new idea</h2>

            <label class="mt-4 block text-sm font-bold" for="idea-title">Title</label>
            <input id="idea-title" required class="mt-2 w-full rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950" placeholder="Enter idea title" />

            <label class="mt-4 block text-sm font-bold" for="idea-category">Category</label>
            <select id="idea-category" class="mt-2 w-full rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950">
              ${categories.map((category) => `<option>${category}</option>`).join("")}
            </select>

            <label class="mt-4 block text-sm font-bold" for="idea-image">Image</label>
            <select id="idea-image" class="mt-2 w-full rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950">
              ${seedImages.map((image, index) => `<option value="${image}">Image ${index + 1}</option>`).join("")}
            </select>

            <label class="mt-4 block text-sm font-bold" for="idea-summary">Summary</label>
            <textarea id="idea-summary" required rows="4" class="mt-2 w-full resize-none rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-950" placeholder="Write idea details"></textarea>

            <button class="mt-4 w-full rounded-vault bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700" type="submit">
              Add idea
            </button>
          </form>

          <div>
            <div class="rounded-vault border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div class="grid gap-3 sm:grid-cols-[1fr_180px]">
                <input id="search-input" value="${escapeHtml(state.search)}" class="w-full rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950" placeholder="Search ideas" />
                <select id="category-filter" class="rounded-vault border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950">
                  ${["All", ...categories].map((category) => `<option ${state.category === category ? "selected" : ""}>${category}</option>`).join("")}
                </select>
              </div>
            </div>

            <section class="mt-4 grid gap-4 md:grid-cols-2">
              ${
                ideas.length
                  ? ideas.map(renderIdeaCard).join("")
                  : `<div class="rounded-vault border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 md:col-span-2">No idea found.</div>`
              }
            </section>
          </div>
        </section>
      </section>
    </main>
  `;

  bindEvents();
}

function renderIdeaCard(idea) {
  return `
    <article class="overflow-hidden rounded-vault border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <img class="h-44 w-full object-cover" src="${escapeHtml(idea.image)}" alt="${escapeHtml(idea.title)} image" />
      <div class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">${escapeHtml(idea.category)}</span>
            <h3 class="mt-3 text-lg font-bold">${escapeHtml(idea.title)}</h3>
          </div>
          <button class="save-btn rounded-vault border border-slate-300 px-3 py-1.5 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" data-id="${escapeHtml(idea.id)}">
            ${idea.saved ? "Saved" : "Save"}
          </button>
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">${escapeHtml(idea.summary)}</p>
        <button class="delete-btn mt-4 text-sm font-bold text-red-600 hover:text-red-700" data-id="${escapeHtml(idea.id)}">Delete</button>
      </div>
    </article>
  `;
}

function bindEvents() {
  document.querySelector("#theme-toggle").addEventListener("click", () => {
    setState({ darkMode: !state.darkMode });
  });

  document.querySelector("#search-input").addEventListener("input", (event) => {
    setState({ search: event.target.value });
  });

  document.querySelector("#category-filter").addEventListener("change", (event) => {
    setState({ category: event.target.value });
  });

  document.querySelector("#idea-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const title = form.querySelector("#idea-title").value.trim();
    const category = form.querySelector("#idea-category").value;
    const image = form.querySelector("#idea-image").value;
    const summary = form.querySelector("#idea-summary").value.trim();

    if (!title || !summary) {
      return;
    }

    setState({
      ideas: [
        {
          id: createId(),
          title,
          category,
          summary,
          image,
          saved: false
        },
        ...state.ideas
      ],
      search: "",
      category: "All"
    });
  });

  document.querySelectorAll(".save-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;

      setState({
        ideas: state.ideas.map((idea) =>
          idea.id === id ? { ...idea, saved: !idea.saved } : idea
        )
      });
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      setState({ ideas: state.ideas.filter((idea) => idea.id !== id) });
    });
  });
}

render();
let seedIdeaIndex = 0;
const initialState = {
theme: "light",
users: [
{
id: "u_demo",
name: "Demo Founder",
3 | P a g e
email: "demo@ideavault.dev",
password: "DemoPass",
photo: "https://images.unsplash.com/photo-1494790108377-
be9c29b29330?auto=format&fit=crop&w=120&q=80"
}
],
ideas: [
makeSeedIdea("Carbon Lens for Small Retailers", "Climate", "A lightweight emissions tracker that
estimates store-level carbon impact from utility bills and inventory receipts.", "Small retailers rarely have
sustainability staff. Carbon Lens converts everyday operational data into practical carbon reduction
tasks and shareable progress reports.", "Independent retailers", "Carbon accounting is expensive and too
complex for neighborhood shops.", "Automated receipt parsing, utility import, and clear
recommendations ranked by cost impact.", 18000, ["climate", "analytics"], seedImages[0], 32, 18),
makeSeedIdea("AI Mentor Booth", "AI", "A voice-first learning kiosk for community centers that helps
adults practice interviews, resumes, and digital skills.", "The booth provides guided practice sessions,
local-language coaching, and a dashboard for mentors to see where learners need support.",
"Community education programs", "Adult learners need repeated, low-pressure practice outside class
hours.", "Conversational AI, rubric-based feedback, and printable next steps.", 42000, ["education",
"voice-ai"], seedImages[1], 28, 13),
makeSeedIdea("MediLoop Check-ins", "Health", "A post-visit follow-up tool that catches patient
confusion before it turns into readmission risk.", "MediLoop sends simple mobile check-ins after
appointments and flags unclear medication instructions, worsening symptoms, and missed follow-ups.",
"Clinics and discharge teams", "Patients often leave visits overwhelmed and unsure what to do next.",
"Plain-language prompts, risk scoring, and nurse-friendly queues.", 65000, ["health", "patient-care"],
seedImages[2], 25, 16),
makeSeedIdea("SkillSwap Campus", "Education", "A barter marketplace where students trade microlessons in design, coding, writing, and career prep.", "Students earn credits by teaching what they know
and spend credits to book short peer learning sessions.", "University students", "Many students need
affordable help, while peers have useful skills but no easy exchange system.", "Reputation-based credit
exchange with moderated learning circles.", 9000, ["campus", "marketplace"], seedImages[3], 21, 9),
makeSeedIdea("LocalPay Float", "FinTech", "A cash-flow smoother for microbusinesses that predicts
tight weeks and suggests safer payment timing.", "LocalPay Float connects invoices, sales, and recurring
expenses, then gives owners simple cash-position warnings before the crunch arrives.", "Microbusiness
owners", "Small operators make payment decisions without enough forward visibility.", "Forecasting,
4 | P a g e
invoice reminders, and scenario planning in plain language.", 35000, ["finance", "smb"], seedImages[4],
19, 11),
makeSeedIdea("WasteLess Kitchen", "Food", "A restaurant prep assistant that turns leftover patterns
into weekly purchasing and menu suggestions.", "The tool tracks ingredient waste from quick end-of-shift
inputs and recommends order adjustments or specials to reduce spoilage.", "Small restaurants", "Food
waste quietly eats margins and sustainability goals.", "Waste logging, trend alerts, and menu idea
generation.", 22000, ["food", "operations"], seedImages[5], 17, 8)
],
comments: [
{ id: uid(), ideaId: "idea_1", userId: "u_demo", userName: "Demo Founder", text: "The retailer reporting
angle makes this easier to sell than a generic dashboard.", createdAt: daysAgo(2) },
{ id: uid(), ideaId: "idea_2", userId: "u_demo", userName: "Demo Founder", text: "Could work beautifully
with libraries and job centers.", createdAt: daysAgo(1) }
],
bookmarks: []
};
function makeSeedIdea(title, category, shortDescription, detailedDescription, targetAudience,
problemStatement, proposedSolution, budget, tags, image, likes, commentsCount) {
const index = ++seedIdeaIndex;
return {
id: `idea_${index}`,
ownerId: "u_demo",
ownerName: "Demo Founder",
title,
category,
shortDescription,
detailedDescription,
tags,
5 | P a g e
image,
budget,
targetAudience,
problemStatement,
proposedSolution,
likes,
createdAt: daysAgo(index + commentsCount / 10)
};
}
let state = loadState();
let currentUser = getSessionUser();
let pendingRoute = "#/";
let slideIndex = 0;
let slideTimer;
document.documentElement.dataset.theme = state.theme;
document.documentElement.classList.toggle("dark", state.theme === "dark");
window.addEventListener("hashchange", render);
document.addEventListener("click", handleGlobalClick);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);
render();
function addTw(selector, classes, root = document) {
const elements = [];
if (root instanceof Element && root.matches(selector)) elements.push(root);
6 | P a g e
root.querySelectorAll(selector).forEach((element) => elements.push(element));
elements.forEach((element) => {
element.classList.add(...classes.trim().split(/\s+/));
});
}
function applyTailwind(root = document) {
const styles = [
["body", "m-0 min-w-80 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"],
[".app-shell", "min-h-screen flex flex-col"],
[".container", "mx-auto w-full max-w-[1180px] px-4"],
[".navbar", "sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:borderslate-800 dark:bg-slate-900/90"],
[".nav-inner", "min-h-[72px] flex items-center justify-between gap-4"],
[".brand", "inline-flex items-center gap-2.5 text-lg font-extrabold"],
[".brand-mark", "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-vault-teal to-vaultblue text-white shadow-lg shadow-teal-700/20"],
[".nav-links", "absolute left-4 right-4 top-[74px] hidden flex-col items-stretch gap-2 rounded-lg border
border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 lg:static lg:flex lg:flexrow lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent"],
[".nav-actions", "flex items-center gap-2"],
[".nav-link", "inline-flex min-h-10 items-center justify-start gap-2 rounded-lg px-3 py-2 font-bold
transition hover:-translate-y-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:justify-center"],
[".nav-link.active", "bg-slate-100 dark:bg-slate-800"],
[".btn", "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-transparent px3 py-2 font-bold transition hover:-translate-y-0.5"],
[".primary", "bg-vault-teal text-white hover:bg-teal-700"],
[".secondary", "border-slate-200 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-700
dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"],
7 | P a g e
[".danger", "bg-red-600 text-white hover:bg-red-700"],
[".ghost", "bg-slate-100 dark:bg-slate-800"],
[".icon-btn", "inline-grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white
font-bold transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900
dark:hover:bg-slate-800"],
[".mobile-toggle", "lg:hidden"],
[".profile", "relative"],
[".avatar", "h-9 w-9 rounded-full border-2 border-vault-teal object-cover"],
[".dropdown", "absolute right-0 top-12 hidden w-64 rounded-lg border border-slate-200 bg-white p-3
shadow-2xl dark:border-slate-700 dark:bg-slate-900"],
["main", "flex-1"],
[".footer", "mt-10 border-t border-slate-200 bg-white py-9 dark:border-slate-800 dark:bg-slate-900"],
[".footer-grid", "grid gap-6 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]"],
[".footer a", "my-2 block text-slate-500 dark:text-slate-400"],
[".footer p", "my-2 text-slate-500 dark:text-slate-400"],
[".hero", "py-8"],
[".slider", "relative min-h-[420px] overflow-hidden rounded-lg bg-slate-950 text-white shadow-2xl
sm:min-h-[460px] lg:min-h-[420px]"],
[".slide", "absolute inset-0 grid items-center bg-cover bg-center p-7 opacity-0 transition-opacity
duration-500 sm:p-10 lg:p-16"],
[".slide-content", "relative z-10 max-w-2xl"],
[".kicker", "text-xs font-extrabold uppercase text-teal-200"],
[".hero h1", "my-3 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl"],
[".hero p", "mb-5 max-w-2xl text-base text-white/80 sm:text-lg"],
[".slider-dots", "absolute bottom-7 left-7 z-10 flex gap-2 sm:left-10 lg:left-16"],
[".dot", "h-1.5 w-9 rounded-full border-0 bg-white/40"],
[".section", "py-9"],
[".section-head", "mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"],
[".section-head h2", "m-0 text-2xl font-extrabold"],
8 | P a g e
[".section-head p", "text-slate-500 dark:text-slate-400"],
[".page-title", "mb-6"],
[".page-title h1", "m-0 text-4xl font-extrabold leading-tight sm:text-5xl"],
[".page-title p", "mt-3 max-w-2xl text-slate-500 dark:text-slate-400"],
[".grid", "grid gap-5 md:grid-cols-2 lg:grid-cols-3"],
[".card", "flex min-h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadowlg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900"],
[".card-img", "aspect-video w-full bg-slate-100 object-cover dark:bg-slate-800"],
[".card-body", "flex flex-1 flex-col gap-3 p-4"],
[".card h3", "m-0 text-lg font-extrabold leading-snug lg:min-h-[58px]"],
[".card p", "m-0 text-slate-500 dark:text-slate-400"],
[".meta-row", "flex flex-wrap gap-2"],
[".tag-row", "flex flex-wrap gap-2"],
[".pill", "inline-flex min-h-7 items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold textslate-500 dark:bg-slate-800 dark:text-slate-400"],
[".card-actions", "mt-auto flex flex-wrap gap-2"],
[".feature-band", "grid gap-5 md:grid-cols-3"],
[".feature", "rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"],
[".feature h3", "mt-3 text-lg font-extrabold"],
[".feature svg", "text-vault-teal"],
[".stats", "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"],
[".stat", "rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"],
[".stat svg", "text-vault-teal"],
[".stat strong", "mt-2 block text-3xl font-extrabold"],
[".toolbar", "mb-5 grid gap-3 lg:grid-cols-[1fr_210px_170px_170px]"],
[".form-grid", "grid gap-4 md:grid-cols-2"],
[".field", "grid gap-2"],
[".field.full", "md:col-span-2"],
9 | P a g e
["label", "text-sm font-extrabold"],
["input", "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outlinenone focus:border-vault-teal focus:ring-4 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950
dark:text-slate-100"],
["textarea", "min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate900 outline-none focus:border-vault-teal focus:ring-4 focus:ring-teal-600/20 dark:border-slate-700
dark:bg-slate-950 dark:text-slate-100"],
["select", "min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outlinenone focus:border-vault-teal focus:ring-4 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-950
dark:text-slate-100"],
[".panel", "rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5
dark:border-slate-800 dark:bg-slate-900"],
[".auth-wrap", "mx-auto my-10 w-full max-w-[460px] px-4"],
[".details", "grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]"],
[".details img", "max-h-[430px] w-full rounded-lg object-cover"],
[".comment", "mb-3 rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-700
dark:bg-slate-800"],
[".comment-head", "flex justify-between gap-3 text-sm text-slate-500 dark:text-slate-400"],
[".empty", "grid min-h-[220px] place-items-center rounded-lg border border-dashed border-slate-300
bg-white text-center dark:border-slate-700 dark:bg-slate-900"],
[".empty svg", "mx-auto text-vault-teal"],
[".modal-backdrop", "fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-5"],
[".modal", "max-h-[calc(100vh-36px)] w-full max-w-[760px] overflow-auto rounded-lg border borderslate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"],
[".modal.small", "max-w-[430px]"],
[".spinner-wrap", "grid min-h-[300px] place-items-center"],
[".spinner", "h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-vault-teal
dark:border-slate-800 dark:border-t-vault-teal"],
["#toast-root", "fixed bottom-4 right-4 z-[80] grid gap-2"],
[".toast", "w-80 max-w-[90vw] rounded-lg bg-slate-900 px-4 py-3 text-white shadow-2xl"],
10 | P a g e
[".toast.success", "bg-green-600"],
[".toast.error", "bg-red-600"],
[".muted", "text-slate-500 dark:text-slate-400"]
];
styles.forEach(([selector, classes]) => addTw(selector, classes, root));
root.querySelectorAll(".slide").forEach((slide) => {
if (slide.dataset.bg) slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
slide.classList.toggle("opacity-100", slide.classList.contains("active"));
slide.classList.toggle("opacity-0", !slide.classList.contains("active"));
slide.classList.add("before:absolute", "before:inset-0", "before:bg-gradient-to-r", "before:from-slate950/90", "before:via-slate-950/55", "before:to-slate-950/10");
});
root.querySelectorAll(".dot").forEach((dot) => {
dot.classList.toggle("bg-white", dot.classList.contains("active"));
dot.classList.toggle("bg-white/40", !dot.classList.contains("active"));
});
}
function uid() {
return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() :
`id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function daysAgo(days) {
const date = new Date();
date.setDate(date.getDate() - days);
return date.toISOString();
11 | P a g e
}
function loadState() {
try {
const saved = localStorage.getItem(STORAGE_KEY);
if (!saved) {
const freshState = cloneState(initialState);
localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
return freshState;
}
return normalizeState(JSON.parse(saved));
} catch {
const freshState = cloneState(initialState);
localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
return freshState;
}
}
function saveState() {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function cloneState(value) {
return JSON.parse(JSON.stringify(value));
}
function normalizeState(saved) {
12 | P a g e
return {
theme: saved.theme === "dark" ? "dark" : "light",
users: Array.isArray(saved.users) ? saved.users : cloneState(initialState.users),
ideas: Array.isArray(saved.ideas) ? saved.ideas : cloneState(initialState.ideas),
comments: Array.isArray(saved.comments) ? saved.comments : [],
bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : []
};
}
function getSessionUser() {
const token = localStorage.getItem(TOKEN_KEY);
if (!token) return null;
try {
const userId = atob(token.split(".")[1] || "");
return state.users.find((user) => user.id === userId) || null;
} catch {
localStorage.removeItem(TOKEN_KEY);
return null;
}
}
function setSession(user) {
localStorage.setItem(TOKEN_KEY, `local.${btoa(user.id)}.${Date.now()}`);
currentUser = user;
}
function clearSession() {
13 | P a g e
localStorage.removeItem(TOKEN_KEY);
currentUser = null;
}
function route() {
return location.hash || "#/";
}
function navigate(hash) {
location.hash = hash;
}
function isPrivate(hash) {
return ["#/add", "#/my-ideas", "#/interactions", "#/profile"].includes(hash) || hash.startsWith("#/ideas/");
}
function render() {
const hash = route();
if (isPrivate(hash) && !currentUser) {
pendingRoute = hash;
showToast("Please log in to continue.", "error");
navigate("#/login");
return;
}
const app = document.getElementById("app");
app.innerHTML = `
14 | P a g e
<div class="app-shell">
${navbar()}
<main>${loading()}</main>
${footer()}
</div>
`;
applyTailwind(document);
setTitle(hash);
setTimeout(() => {
const main = document.querySelector("main");
try {
main.innerHTML = viewFor(hash);
applyTailwind(main);
afterRender(hash);
} catch (error) {
console.error(error);
main.innerHTML = notFoundView("Something went wrong", "Please refresh the page or try another
route.");
applyTailwind(main);
showToast("A page error occurred. Please try again.", "error");
}
}, 160);
}
function setTitle(hash) {
const labels = {
15 | P a g e
"#/": "Home",
"#/ideas": "Ideas",
"#/add": "Add Idea",
"#/my-ideas": "My Ideas",
"#/interactions": "My Interactions",
"#/login": "Login",
"#/register": "Register",
"#/profile": "Profile"
};
document.title = `${labels[hash] || (hash.startsWith("#/ideas/") ? "Idea Details" : "Not Found")} |
IdeaVault`;
}
function navbar() {
const links = [
["#/", "Home", false],
["#/ideas", "Ideas", false],
["#/add", "Add Idea", true],
["#/my-ideas", "My Ideas", true],
["#/interactions", "My Interactions", true]
];
return `
<header class="navbar">
<div class="container nav-inner">
<a class="brand" href="#/"><span class="brandmark">${icons.vault}</span><span>IdeaVault</span></a>
<nav class="nav-links" id="navLinks">
${links
16 | P a g e
.filter(([, , privateLink]) => !privateLink || currentUser)
.map(([href, text]) => `<a class="nav-link ${route() === href ? "active" : ""}"
href="${href}">${text}</a>`)
.join("")}
</nav>
<div class="nav-actions">
<button class="icon-btn" data-action="theme" title="Toggle theme">${state.theme === "dark" ?
icons.sun : icons.moon}</button>
${
currentUser
? `<div class="profile">
<button class="icon-btn" data-action="profile-menu" title="Profile menu"><img class="avatar"
src="${escapeHtml(currentUser.photo)}" alt="${escapeHtml(currentUser.name)}" /></button>
<div class="dropdown" id="profileDropdown">
<p><strong>${escapeHtml(currentUser.name)}</strong><br><span
class="muted">${escapeHtml(currentUser.email)}</span></p>
<a class="btn secondary" href="#/profile">${icons.edit} Profile Management</a>
<button class="btn secondary" data-action="logout">Logout</button>
</div>
</div>`
: `<a class="btn secondary" href="#/login">Login/Register</a>`
}
<button class="icon-btn mobile-toggle" data-action="mobile-menu" title="Open
menu">${icons.menu}</button>
</div>
</div>
</header>
`;
}
function footer() {
return `
<footer class="footer">
<div class="container footer-grid">
<div>
<a class="brand" href="#/"><span class="brandmark">${icons.vault}</span><span>IdeaVault</span></a>
<p>Startup idea sharing, validation, and collaboration for builders who want feedback early.</p>
</div>
<div><strong>Platform</strong><a href="#/ideas">Ideas</a><a href="#/ideas">Categories</a><a
href="#/add">Add Idea</a></div>
<div><strong>Contact</strong><p>hello@ideavault.dev</p><p>Dhaka, Bangladesh</p></div>
<div><strong>Social</strong><a href="#">LinkedIn</a><a href="#">${icons.x} X</a><a
href="#">GitHub</a><p>Copyright ${new Date().getFullYear()} IdeaVault</p></div>
</div>
</footer>
`;
}
function loading() {
return `<div class="spinner-wrap"><div class="spinner" aria-label="Loading"></div></div>`;
}
function viewFor(hash) {
if (hash === "#/" || hash === "") return homeView();
if (hash === "#/ideas") return ideasView();
if (hash.startsWith("#/ideas/")) return detailsView(hash.split("/").pop());
18 | P a g e
if (hash === "#/add") return ideaFormView();
if (hash === "#/my-ideas") return myIdeasView();
if (hash === "#/interactions") return interactionsView();
if (hash === "#/login") return loginView();
if (hash === "#/register") return registerView();
if (hash === "#/profile") return profileView();
return notFoundView();
}
function homeView() {
const trending = [...state.ideas]
.sort((a, b) => trendScore(b) - trendScore(a))
.slice(0, 6);
return `
<section class="hero">
<div class="container">
<div class="slider" id="slider">
${[
["Validate Bold Ideas Faster", "Share a startup concept, gather useful feedback, and find the signal
before you spend months building.", seedImages[0]],
["Find Collaborators With Context", "Explore problems, audiences, budgets, and proposed
solutions from founders thinking out loud.", seedImages[4]],
["Turn Feedback Into Momentum", "Comments and interactions help shape raw concepts into
sharper, community-tested opportunities.", seedImages[2]]
]
.map((slide, i) => `<article class="slide ${i === 0 ? "active" : ""}" data-bg="${slide[2]}"><div
class="slide-content"><span class="kicker">Startup validation
hub</span><h1>${slide[0]}</h1><p>${slide[1]}</p><a class="btn primary" href="#/ideas">Explore
Ideas</a></div></article>`)
19 | P a g e
.join("")}
<div class="slider-dots">${[0, 1, 2].map((i) => `<button class="dot ${i === 0 ? "active" : ""}" dataaction="slide" data-index="${i}" title="Slide ${i + 1}"></button>`).join("")}</div>
</div>
</div>
</section>
<section class="section"><div class="container">${sectionHead("Trending Ideas", "Top ideas ranked by
likes and recent comment activity.", "#/ideas")}${ideaGrid(trending)}</div></section>
<section class="section"><div class="container"><div class="feature-band">
${feature(icons.spark, "Shape Raw Concepts", "Capture the problem, audience, solution, budget, and
tags in one structured startup brief.")}
${feature(icons.users, "Discuss With Builders", "Protected comments keep useful feedback tied to real
community profiles.")}
${feature(icons.chart, "Spot Momentum", "Trending scores highlight ideas earning engagement, not
just the newest posts.")}
</div></div></section>
<section class="section"><div class="container"><div class="stats">
${stat(icons.spark, state.ideas.length, "Ideas shared")}
${stat(icons.users, state.users.length, "Members")}
${stat(icons.chart, state.comments.length, "Comments")}
${stat(icons.bookmark, state.bookmarks.length, "Bookmarks")}
</div></div></section>
`;
}
function ideasView() {
return `
<section class="section">
<div class="container">
20 | P a g e
<div class="page-title"><h1>Explore Ideas</h1><p>Search by title, filter by category, and narrow
ideas by creation date.</p></div>
<div class="toolbar">
<input id="searchInput" type="search" placeholder="Search idea title" />
<select id="categoryFilter"><option value="">All categories</option>${categories.map((c) =>
`<option value="${c}">${c}</option>`).join("")}</select>
<input id="fromDate" type="date" />
<input id="toDate" type="date" />
</div>
<div id="ideasResults">${ideaGrid(state.ideas)}</div>
</div>
</section>
`;
}
function detailsView(id) {
const idea = state.ideas.find((item) => item.id === id);
if (!idea) return notFoundView();
const comments = state.comments.filter((comment) => comment.ideaId === id).sort((a, b) => new
Date(b.createdAt) - new Date(a.createdAt));
return `
<section class="section">
<div class="container details">
<article class="panel">
<img src="${escapeHtml(idea.image)}" alt="${escapeHtml(idea.title)}" />
<p class="kicker">${escapeHtml(idea.category)}</p>
<h1>${escapeHtml(idea.title)}</h1>
<p>${escapeHtml(idea.detailedDescription)}</p>
21 | P a g e
<h3>Problem Statement</h3><p>${escapeHtml(idea.problemStatement)}</p>
<h3>Proposed Solution</h3><p>${escapeHtml(idea.proposedSolution)}</p>
<div class="meta-row">
<span class="pill">Audience: ${escapeHtml(idea.targetAudience)}</span>
<span class="pill">Budget: ${idea.budget ? `$${Number(idea.budget).toLocaleString()}` :
"Open"}</span>
<span class="pill">${formatDate(idea.createdAt)}</span>
</div>
<div class="tag-row">${(idea.tags || []).map((tag) => `<span
class="pill">#${escapeHtml(tag)}</span>`).join("")}</div>
<p class="muted">Posted by ${escapeHtml(idea.ownerName)}</p>
</article>
<aside class="panel">
<h2>Discussion</h2>
<form id="commentForm" data-idea="${idea.id}">
<div class="field"><label for="commentText">Add comment</label><textarea id="commentText"
name="commentText" required placeholder="Share feedback, concerns, or validation
signals"></textarea></div>
<button class="btn primary" type="submit">Comment</button>
</form>
<div class="h-[18px]"></div>
<div id="commentsList">${comments.length ? comments.map(commentView).join("") : empty("No
comments yet.", "Start the discussion with practical feedback.")}</div>
</aside>
</div>
</section>
`;
}
22 | P a g e
function ideaFormView(idea = null) {
const isEdit = Boolean(idea);
return `
<section class="section">
<div class="container">
<div class="page-title"><h1>${isEdit ? "Update Idea" : "Add Startup Idea"}</h1><p>Give the
community enough context to evaluate the opportunity.</p></div>
<form class="panel form-grid" id="${isEdit ? "updateIdeaForm" : "addIdeaForm"}" ${isEdit ? `dataid="${idea.id}"` : ""}>
${ideaFields(idea)}
<div class="field full"><button class="btn primary" type="submit">${icons.plus} ${isEdit ? "Save
Changes" : "Submit Idea"}</button></div>
</form>
</div>
</section>
`;
}
function ideaFields(idea = {}) {
idea = idea || {};
return `
${field("Idea Title", "title", "text", idea.title, true)}
<div class="field"><label for="category">Category</label><select id="category" name="category"
required>${categories.map((c) => `<option ${idea.category === c ? "selected" : ""}
value="${c}">${c}</option>`).join("")}</select></div>
${field("Short Description", "shortDescription", "text", idea.shortDescription, true)}
${field("Image URL", "image", "url", idea.image, true)}
23 | P a g e
<div class="field full"><label for="detailedDescription">Detailed Description</label><textarea
id="detailedDescription" name="detailedDescription" required>${escapeHtml(idea.detailedDescription
|| "")}</textarea></div>
${field("Tags", "tags", "text", (idea.tags || []).join(", "), false, "Comma separated")}
${field("Estimated Budget", "budget", "number", idea.budget, false)}
${field("Target Audience", "targetAudience", "text", idea.targetAudience, true)}
<div class="field"><label for="problemStatement">Problem Statement</label><textarea
id="problemStatement" name="problemStatement" required>${escapeHtml(idea.problemStatement ||
"")}</textarea></div>
<div class="field"><label for="proposedSolution">Proposed Solution</label><textarea
id="proposedSolution" name="proposedSolution" required>${escapeHtml(idea.proposedSolution ||
"")}</textarea></div>
`;
}
function myIdeasView() {
const mine = state.ideas.filter((idea) => idea.ownerId === currentUser.id);
return `
<section class="section"><div class="container">
<div class="page-title"><h1>My Ideas</h1><p>Update drafts, remove outdated concepts, and keep
your vault current.</p></div>
${mine.length ? ideaGrid(mine, true) : empty("No ideas yet.", "Add your first startup concept to begin
collecting feedback.")}
</div></section>
`;
}
function interactionsView() {
const mine = state.comments.filter((comment) => comment.userId === currentUser.id);
24 | P a g e
const ideas = mine.map((comment) => ({ comment, idea: state.ideas.find((idea) => idea.id ===
comment.ideaId) })).filter((item) => item.idea);
return `
<section class="section"><div class="container">
<div class="page-title"><h1>My Interactions</h1><p>Ideas where you joined the
discussion.</p></div>
<div class="grid">${ideas.length ? ideas.map(({ comment, idea }) => ideaCard(idea, false,
comment.text)).join("") : empty("No interactions yet.", "Comment on an idea and it will appear
here.")}</div>
</div></section>
`;
}
function loginView() {
return `
<section class="auth-wrap panel">
<h1>Login</h1>
<form id="loginForm" class="form-grid">
${field("Email", "email", "email", "", true)}
${field("Password", "password", "password", "", true)}
<div class="field full"><a class="muted" href="#">Forget Password?</a></div>
<div class="field full"><button class="btn primary" type="submit">Login</button></div>
</form>
<button class="btn secondary w-full mt-2.5" data-action="google-login">Google Login</button>
<p>New here? <a class="muted" href="#/register">Create an account</a></p>
</section>
`;
}
25 | P a g e
function registerView() {
return `
<section class="auth-wrap panel">
<h1>Register</h1>
<form id="registerForm" class="form-grid">
${field("Name", "name", "text", "", true)}
${field("Email", "email", "email", "", true)}
${field("Photo URL", "photo", "url", "", true)}
${field("Password", "password", "password", "", true)}
<div class="field full"><button class="btn primary" type="submit">Register</button></div>
</form>
<p>Already have an account? <a class="muted" href="#/login">Log in</a></p>
</section>
`;
}
function profileView() {
return `
<section class="auth-wrap panel">
<h1>Profile Management</h1>
<form id="profileForm" class="form-grid">
${field("Name", "name", "text", currentUser.name, true)}
${field("Photo URL", "photo", "url", currentUser.photo, true)}
<div class="field full"><button class="btn primary" type="submit">Update Profile</button></div>
</form>
</section>
26 | P a g e
`;
}
function notFoundView(title = "404 - Page not found", text = "The page you opened does not exist.") {
return `<section class="section"><div class="container">${empty(title, text)}<p><a class="btn primary"
href="#/">Back Home</a></p></div></section>`;
}
function ideaGrid(ideas, ownerTools = false) {
return ideas.length ? `<div class="grid">${ideas.map((idea) => ideaCard(idea,
ownerTools)).join("")}</div>` : empty("No ideas found.", "Try a different search or category filter.");
}
function ideaCard(idea, ownerTools = false, interactionText = "") {
const count = state.comments.filter((comment) => comment.ideaId === idea.id).length;
return `
<article class="card">
<img class="card-img" src="${escapeHtml(idea.image)}" alt="${escapeHtml(idea.title)}" />
<div class="card-body">
<div class="meta-row"><span class="pill">${escapeHtml(idea.category)}</span><span
class="pill">${formatDate(idea.createdAt)}</span></div>
<h3>${escapeHtml(idea.title)}</h3>
<p>${escapeHtml(idea.shortDescription)}</p>
<div class="meta-row"><span class="pill">${idea.likes} likes</span><span class="pill">${count}
comments</span><span class="pill">${idea.budget ? `$${Number(idea.budget).toLocaleString()}` :
"Budget open"}</span></div>
${interactionText ? `<p><strong>Your comment:</strong> ${escapeHtml(interactionText)}</p>` : ""}
<div class="card-actions">
<a class="btn primary" href="#/ideas/${idea.id}">View Details</a>
27 | P a g e
<button class="btn secondary" data-action="bookmark" data-id="${idea.id}">${icons.bookmark}
Bookmark</button>
${ownerTools ? `<button class="btn secondary" data-action="edit-idea" dataid="${idea.id}">${icons.edit} Update</button><button class="btn danger" data-action="delete-idea"
data-id="${idea.id}">${icons.trash} Delete</button>` : ""}
</div>
</div>
</article>
`;
}

function commentView(comment) {
const mine = currentUser && comment.userId === currentUser.id;
return `
<div class="comment">
<div class="commenthead"><strong>${escapeHtml(comment.userName)}</strong><span>${formatDate(comment.createdAt
)}</span></div>
<p>${escapeHtml(comment.text)}</p>
${mine ? `<button class="btn secondary" data-action="edit-comment" dataid="${comment.id}">${icons.edit} Edit</button> <button class="btn danger" data-action="deletecomment" data-id="${comment.id}">${icons.trash} Delete</button>` : ""}
</div>
`;
}
function sectionHead(title, text, link) {
return `<div class="section-head"><div><h2>${title}</h2><p>${text}</p></div><a class="btn
secondary" href="${link}">View All</a></div>`;
28 | P a g e
}
function feature(icon, title, text) {
return `<article class="feature">${icon}<h3>${title}</h3><p class="muted">${text}</p></article>`;
}
function stat(icon, value, label) {
return `<article class="stat">${icon}<strong>${value}</strong><span
class="muted">${label}</span></article>`;
}
function field(label, name, type, value = "", required = false, placeholder = "") {
return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}"
type="${type}" value="${escapeHtml(value || "")}" ${required ? "required" : ""}
placeholder="${placeholder}" /></div>`;
}
function empty(title, text) {
return `<div class="empty"><div>${icons.spark}<h2>${title}</h2><p
class="muted">${text}</p></div></div>`;
}
function afterRender(hash) {
if (hash === "#/") startSlider();
else clearInterval(slideTimer);
}
function startSlider() {
29 | P a g e
clearInterval(slideTimer);
slideTimer = setInterval(() => setSlide((slideIndex + 1) % 3), 4200);
}
function setSlide(index) {
slideIndex = index;
document.querySelectorAll(".slide").forEach((slide, i) => {
const selected = i === index;
slide.classList.toggle("active", selected);
slide.classList.toggle("opacity-100", selected);
slide.classList.toggle("opacity-0", !selected);
});
document.querySelectorAll(".dot").forEach((dot, i) => {
const selected = i === index;
dot.classList.toggle("active", selected);
dot.classList.toggle("bg-white", selected);
dot.classList.toggle("bg-white/40", !selected);
});
}
function handleGlobalClick(event) {
const button = event.target.closest("[data-action]");
if (!button) return;
const action = button.dataset.action;
if (action === "theme") toggleTheme();
if (action === "mobile-menu") document.getElementById("navLinks")?.classList.toggle("hidden");
30 | P a g e
if (action === "profile-menu")
document.getElementById("profileDropdown")?.classList.toggle("hidden");
if (action === "logout") {
clearSession();
showToast("Logged out successfully.", "success");
navigate("#/");
render();
}
if (action === "google-login") googleLogin();
if (action === "slide") setSlide(Number(button.dataset.index));
if (action === "bookmark") bookmarkIdea(button.dataset.id);
if (action === "edit-idea") openIdeaModal(button.dataset.id);
if (action === "delete-idea") confirmDeleteIdea(button.dataset.id);
if (action === "edit-comment") editComment(button.dataset.id);
if (action === "delete-comment") deleteComment(button.dataset.id);
if (action === "close-modal") closeModal();
if (action === "confirm-delete") deleteIdea(button.dataset.id);
}
function handleSubmit(event) {
const form = event.target;
if (!form.id) return;
event.preventDefault();
const data = Object.fromEntries(new FormData(form).entries());
if (form.id === "loginForm") login(data);
if (form.id === "registerForm") register(data);
if (form.id === "addIdeaForm") saveIdea(data);
31 | P a g e
if (form.id === "updateIdeaForm") updateIdea(form.dataset.id, data);
if (form.id === "commentForm") addComment(form.dataset.idea, data.commentText);
if (form.id === "profileForm") updateProfile(data);
}
function handleInput(event) {
if (["searchInput", "categoryFilter", "fromDate", "toDate"].includes(event.target.id)) filterIdeas();
}
function toggleTheme() {
state.theme = state.theme === "dark" ? "light" : "dark";
document.documentElement.dataset.theme = state.theme;
document.documentElement.classList.toggle("dark", state.theme === "dark");
saveState();
render();
}
function login(data) {
const user = state.users.find((item) => item.email.toLowerCase() === data.email.toLowerCase() &&
item.password === data.password);
if (!user) return showToast("Invalid email or password.", "error");
setSession(user);
showToast("Login successful.", "success");
navigate(pendingRoute || "#/");
}
function googleLogin() {
32 | P a g e
let user = state.users.find((item) => item.email === "google.user@ideavault.dev");
if (!user) {
user = { id: uid(), name: "Google Founder", email: "google.user@ideavault.dev", password:
"GooglePass", photo: "https://images.unsplash.com/photo-1500648767791-
00dcc994a43e?auto=format&fit=crop&w=120&q=80" };
state.users.push(user);
saveState();
}
setSession(user);
showToast("Google login successful.", "success");
navigate(pendingRoute || "#/");
}
function register(data) {
if (state.users.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) return
showToast("Email already exists.", "error");
if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(data.password)) return showToast("Password needs 6 characters
with uppercase and lowercase letters.", "error");
const user = { id: uid(), ...data };
state.users.push(user);
saveState();
setSession(user);
showToast("Registration successful.", "success");
navigate(pendingRoute || "#/");
}
function saveIdea(data) {
const idea = normalizeIdea(data);
33 | P a g e
state.ideas.unshift(idea);
saveState();
showToast("Idea submitted successfully.", "success");
navigate("#/my-ideas");
}
function updateIdea(id, data) {
const index = state.ideas.findIndex((idea) => idea.id === id && idea.ownerId === currentUser.id);
if (index < 0) return showToast("You can only update your own ideas.", "error");
state.ideas[index] = { ...state.ideas[index], ...normalizeIdea(data, false) };
saveState();
closeModal();
showToast("Idea updated successfully.", "success");
render();
}
function normalizeIdea(data, isNew = true) {
return {
...(isNew ? { id: uid(), ownerId: currentUser.id, ownerName: currentUser.name, likes: 0, createdAt: new
Date().toISOString() } : {}),
title: data.title.trim(),
shortDescription: data.shortDescription.trim(),
detailedDescription: data.detailedDescription.trim(),
category: data.category,
tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
image: data.image.trim(),
budget: data.budget ? Number(data.budget) : "",
34 | P a g e
targetAudience: data.targetAudience.trim(),
problemStatement: data.problemStatement.trim(),
proposedSolution: data.proposedSolution.trim()
};
}
function addComment(ideaId, text) {
state.comments.unshift({ id: uid(), ideaId, userId: currentUser.id, userName: currentUser.name, text:
text.trim(), createdAt: new Date().toISOString() });
saveState();
showToast("Comment added.", "success");
render();
}
function editComment(id) {
const comment = state.comments.find((item) => item.id === id && item.userId === currentUser.id);
if (!comment) return showToast("You can only edit your own comments.", "error");
const text = prompt("Update your comment", comment.text);
if (!text?.trim()) return;
comment.text = text.trim();
comment.createdAt = new Date().toISOString();
saveState();
showToast("Comment updated.", "success");
render();
}
function deleteComment(id) {
35 | P a g e
const comment = state.comments.find((item) => item.id === id && item.userId === currentUser.id);
if (!comment) return showToast("You can only delete your own comments.", "error");
if (!confirm("Delete this comment?")) return;
state.comments = state.comments.filter((item) => item.id !== id);
saveState();
showToast("Comment deleted.", "success");
render();
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
showToast("Profile updated.", "success");
render();
}
function bookmarkIdea(id) {
if (!currentUser) {
36 | P a g e
pendingRoute = route();
showToast("Login to bookmark ideas.", "error");
navigate("#/login");
return;
}
const existing = state.bookmarks.find((item) => item.ideaId === id && item.userId === currentUser.id);
if (existing) state.bookmarks = state.bookmarks.filter((item) => item !== existing);
else state.bookmarks.push({ id: uid(), ideaId: id, userId: currentUser.id, createdAt: new
Date().toISOString() });
saveState();
showToast(existing ? "Bookmark removed." : "Idea bookmarked.", "success");
}
function openIdeaModal(id) {
const idea = state.ideas.find((item) => item.id === id && item.ownerId === currentUser.id);
if (!idea) return;
document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop" id="modalRoot"><div
class="modal"><button class="icon-btn float-right" data-action="closemodal">x</button>${ideaFormView(idea)}</div></div>`);
applyTailwind(document.getElementById("modalRoot"));
}
function confirmDeleteIdea(id) {
document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop" id="modalRoot"><div
class="modal small"><h2>Delete idea?</h2><p class="muted">This removes the idea and its
comments.</p><button class="btn danger" data-action="confirm-delete" dataid="${id}">Delete</button> <button class="btn secondary" data-action="closemodal">Cancel</button></div></div>`);
applyTailwind(document.getElementById("modalRoot"));
37 | P a g e
}
function deleteIdea(id) {
state.ideas = state.ideas.filter((idea) => !(idea.id === id && idea.ownerId === currentUser.id));
state.comments = state.comments.filter((comment) => comment.ideaId !== id);
state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.ideaId !== id);
saveState();
closeModal();
showToast("Idea deleted.", "success");
render();
}
function closeModal() {
document.getElementById("modalRoot")?.remove();
}
function filterIdeas() {
const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
const category = document.getElementById("categoryFilter")?.value || "";
const from = document.getElementById("fromDate")?.value;
const to = document.getElementById("toDate")?.value;
const filtered = state.ideas.filter((idea) => {
const created = idea.createdAt.slice(0, 10);
return idea.title.toLowerCase().includes(search) && (!category || idea.category === category) && (!from
|| created >= from) && (!to || created <= to);
});
document.getElementById("ideasResults").innerHTML = ideaGrid(filtered);
38 | P a g e
applyTailwind(document.getElementById("ideasResults"));
}
function trendScore(idea) {
const comments = state.comments.filter((comment) => comment.ideaId === idea.id).length;
const ageDays = Math.max(1, (Date.now() - new Date(idea.createdAt)) / 86400000);
return idea.likes * 2 + comments * 5 + 12 / ageDays;
}
function formatDate(value) {
return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new
Date(value));
}
function escapeHtml(value) {
return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
"'": "&#039;" }[char]));
}
function showToast(message, type = "") {
const root = document.getElementById("toast-root");
const toast = document.createElement("div");
toast.className = `toast ${type}`;
toast.textContent = message;
root.appendChild(toast);
applyTailwind(root);
setTimeout(() => toast.remove(), 3200);
}