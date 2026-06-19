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
