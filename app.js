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