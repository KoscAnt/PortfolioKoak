const accordions = document.querySelectorAll(".accordion");

accordions.forEach(accordion => {
    accordion.addEventListener("click", () => {
        accordion.classList.toggle("active");
    });
});

const filterButtons = document.querySelectorAll(".filter-button");
const projectItems = document.querySelectorAll(".project-item");
const toolCheckboxes = document.querySelectorAll(".project-tools input[type=\"checkbox\"]");
const toolOptions = document.querySelectorAll(".project-tools .tool-option");

const toolsByCategory = {
    design: new Set(["figma", "adobe-photoshop"]),
    programming: new Set(["vs-studio-code", "visual-studio", "github", "codex"])
};

const toolDisplayNames = {
    "figma": "Figma",
    "adobe-photoshop": "Adobe Photoshop",
    "vs-studio-code": "VS Code",
    "visual-studio": "Visual Studio",
    "github": "GitHub",
    "codex": "Codex"
};

const updateToolVisibility = (category) => {
    const allowed = toolsByCategory[category] || null;
    toolOptions.forEach(option => {
        const tool = option.getAttribute("data-tool");
        if (!tool) return;
        const shouldShow = !allowed || allowed.has(tool);
        option.style.display = shouldShow ? "inline-flex" : "none";
        const input = option.querySelector("input[type=\"checkbox\"]");
        if (input && !shouldShow) {
            input.checked = false;
        }
    });
};

const applyProjectFilters = () => {
    const activeButton = document.querySelector(".filter-button.is-active");
    const categoryFilter = activeButton ? activeButton.getAttribute("data-filter") : "all";
    const selectedTools = Array.from(toolCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    projectItems.forEach(item => {
        const categories = (item.getAttribute("data-category") || "").split(" ");
        const tools = (item.getAttribute("data-tools") || "").split(" ");

        const matchCategory = categoryFilter === "all" || categories.includes(categoryFilter);
        const matchTools = selectedTools.length === 0 || selectedTools.some(tool => tools.includes(tool));

        item.style.display = (matchCategory && matchTools) ? "flex" : "none";
    });
};

if (filterButtons.length && projectItems.length) {
    filterButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            filterButtons.forEach(btn => btn.classList.remove("is-active"));
            button.classList.add("is-active");
            updateToolVisibility(button.getAttribute("data-filter"));
            applyProjectFilters();
        });
    });
}

if (toolCheckboxes.length && projectItems.length) {
    toolCheckboxes.forEach(cb => cb.addEventListener("change", applyProjectFilters));
}

if (filterButtons.length) {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    const targetButton = filterParam
        ? document.querySelector(`.filter-button[data-filter=\"${filterParam}\"]`)
        : null;

    const smoothScrollTo = (targetY, duration) => {
        const startY = window.scrollY || window.pageYOffset;
        const distance = targetY - startY;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            window.scrollTo(0, startY + distance * ease);
            if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    if (targetButton) {
        filterButtons.forEach(btn => btn.classList.remove("is-active"));
        targetButton.classList.add("is-active");
        updateToolVisibility(filterParam);
        applyProjectFilters();
        const section = document.getElementById("projects-section");
        if (section) {
            setTimeout(() => {
                const top = section.getBoundingClientRect().top + window.scrollY;
                smoothScrollTo(top, 1600);
            }, 50);
        }
    } else {
        const activeButton = document.querySelector(".filter-button.is-active");
        updateToolVisibility(activeButton ? activeButton.getAttribute("data-filter") : "all");
    }
}

const projectModal = document.querySelector(".project-modal");
if (projectModal && projectItems.length) {
    const modalGallery = projectModal.querySelector(".project-modal-gallery");
    const modalTitle = projectModal.querySelector(".project-modal-title");
    const modalSubtitle = projectModal.querySelector(".project-modal-subtitle");
    const modalDetails = projectModal.querySelector(".project-modal-details");
    const modalCategory = projectModal.querySelector(".project-modal-category");
    const modalSkills = projectModal.querySelector(".project-modal-tags[data-kind=\"skills\"]");
    const modalTools = projectModal.querySelector(".project-modal-tags[data-kind=\"tools\"]");
    const modalGithubCpp = projectModal.querySelector(".project-modal-github-cpp");
    const modalGithub = projectModal.querySelector(".project-modal-github-web");
    const modalWebsite = projectModal.querySelector(".project-modal-website");
    const modalBack = projectModal.querySelector(".project-modal-back");

    const clearNode = (node) => {
        if (!node) return;
        while (node.firstChild) node.removeChild(node.firstChild);
    };

    const makeTag = (text) => {
        const tag = document.createElement("span");
        tag.className = "project-modal-tag";
        tag.textContent = text.trim();
        return tag;
    };

    const openModal = (item) => {
        const image = item.querySelector(".project_picture");
        const title = item.querySelector(".name_of_project");
        const subtitle = item.querySelector(".description_of_project");
        const details = item.querySelector(".project_description p:not(.project-meta)");
        const modalSubtitleText = (item.getAttribute("data-modal-subtitle") || "").trim();
        const modalDetailsText = (item.getAttribute("data-modal-details") || "").trim();
        const category = item.getAttribute("data-category") || "";
        const skills = (item.getAttribute("data-skills") || "").split(",");
        const tools = (item.getAttribute("data-tools") || "").split(" ");
        const githubCpp = (item.getAttribute("data-github-cpp") || "").trim();
        const github = (item.getAttribute("data-github") || "").trim();
        const website = (item.getAttribute("data-website") || "").trim();
        const images = (item.getAttribute("data-images") || "")
            .split(",")
            .map(src => src.trim())
            .filter(Boolean);

        if (modalGallery) {
            clearNode(modalGallery);
            const sources = images.length ? images : (image ? [image.src] : []);
            modalGallery.classList.toggle("project-modal-gallery--single", sources.length === 1);
            sources.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = title ? `${title.textContent.trim()} image ${index + 1}` : "Project image";
                img.loading = "lazy";
                modalGallery.appendChild(img);
            });
        }
        if (modalTitle && title) {
            modalTitle.textContent = "";
            const sourceLogo = title.querySelector("img");
            if (sourceLogo) {
                const modalLogo = sourceLogo.cloneNode(true);
                modalLogo.classList.remove("project-title-logo--large");
                modalLogo.classList.add("project-modal-title-logo");
                modalTitle.appendChild(modalLogo);
            }
            modalTitle.appendChild(document.createTextNode(title.textContent.trim()));
        }
        if (modalSubtitle) {
            modalSubtitle.textContent = modalSubtitleText || (subtitle ? subtitle.textContent.trim() : "");
        }
        if (modalDetails) {
            modalDetails.textContent = modalDetailsText || (details ? details.textContent.trim() : "");
        }
        if (modalCategory) {
            modalCategory.textContent = category ? `Category: ${category}` : "";
        }
        if (modalSkills) {
            clearNode(modalSkills);
            skills.filter(Boolean).forEach(skill => modalSkills.appendChild(makeTag(skill)));
        }
        if (modalTools) {
            clearNode(modalTools);
            tools
                .filter(Boolean)
                .forEach(tool => modalTools.appendChild(makeTag(toolDisplayNames[tool] || tool)));
        }
        if (modalGithubCpp) {
            if (githubCpp) {
                modalGithubCpp.href = githubCpp;
                modalGithubCpp.style.display = "inline-flex";
            } else {
                modalGithubCpp.removeAttribute("href");
                modalGithubCpp.style.display = "none";
            }
        }
        if (modalGithub) {
            if (github) {
                modalGithub.href = github;
                modalGithub.style.display = "inline-flex";
            } else {
                modalGithub.removeAttribute("href");
                modalGithub.style.display = "none";
            }
        }
        if (modalWebsite) {
            if (website) {
                modalWebsite.href = website;
                modalWebsite.style.display = "inline-flex";
            } else {
                modalWebsite.removeAttribute("href");
                modalWebsite.style.display = "none";
            }
        }

        projectModal.classList.add("is-open");
        projectModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        projectModal.classList.remove("is-open");
        projectModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    projectItems.forEach(item => {
        const button = item.querySelector(".see-more-button");
        if (button) {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                openModal(item);
            });
        }
        item.addEventListener("click", (event) => {
            if (event.target.closest(".see-more-button")) return;
            openModal(item);
        });
    });

    if (modalBack) {
        modalBack.addEventListener("click", closeModal);
    }

    projectModal.addEventListener("click", (event) => {
        if (event.target === projectModal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });

    const projectParam = (new URLSearchParams(window.location.search).get("project") || "").trim();
    if (projectParam) {
        const targetItem = Array.from(projectItems).find(
            item => item.getAttribute("data-project") === projectParam
        );

        if (targetItem) {
            const category = (targetItem.getAttribute("data-category") || "").trim();
            const targetButton = category
                ? document.querySelector(`.filter-button[data-filter="${category}"]`)
                : null;

            if (targetButton) {
                filterButtons.forEach(btn => btn.classList.remove("is-active"));
                targetButton.classList.add("is-active");
                updateToolVisibility(category);
                applyProjectFilters();
            }

            setTimeout(() => openModal(targetItem), 120);
        }
    }
}

const projectContainer = document.querySelector("#project-container");
if (projectContainer && projectItems.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const item = entry.target;
            const index = Array.from(projectItems).indexOf(item);
            item.style.transitionDelay = `${index * 80}ms`;
            item.classList.add("is-visible");

            const textItems = item.querySelectorAll(
                ".project_description h2, .project_description h3, .project_description p, .project_description .see-more-button"
            );
            textItems.forEach((el, i) => {
                el.style.transitionDelay = `${i * 60}ms`;
                el.classList.add("animate-in");
            });
            observer.unobserve(item);
        });
    }, { threshold: 0.2 });

    projectItems.forEach(item => observer.observe(item));
}

const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = (document.getElementById("contact-name")?.value || "").trim();
        const email = (document.getElementById("contact-email")?.value || "").trim();
        const subject = (document.getElementById("contact-subject")?.value || "").trim() || "Full-time role opportunity";
        const message = (document.getElementById("contact-message")?.value || "").trim();

        const body = [
            "Hello Antonia,",
            "",
            "I am reaching out about a full-time role opportunity.",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            "",
            "Message:",
            message
        ].join("\n");

        const mailto = `mailto:antonia.koscak@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
    });
}

const revealElements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, a, li"))
    .filter(el =>
        !el.closest("nav") &&
        !el.closest(".footer") &&
        !el.closest(".about-hero") &&
        !el.closest(".projects-hero") &&
        !el.closest(".contact-hero") &&
        !el.closest(".project-item") &&
        !el.closest(".project-modal") &&
        !el.classList.contains("nav-toggle-bar")
    );

if (revealElements.length) {
    revealElements.forEach(el => el.classList.add("reveal"));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    revealElements.forEach(el => revealObserver.observe(el));
}


const navToggles = document.querySelectorAll(".nav-toggle");

navToggles.forEach(toggle => {
    const nav = toggle.closest("nav");
    const list = nav ? nav.querySelector(".list") : null;
    let resizeRafId = 0;

    const updateCompactNav = () => {
        if (!nav || !list) return;
        if (window.innerWidth <= 768) return;

        nav.classList.remove("nav-compact");
        const shouldCompact = nav.scrollWidth > nav.clientWidth + 1;
        nav.classList.toggle("nav-compact", shouldCompact);

        if (!shouldCompact) {
            nav.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
        }
    };

    updateCompactNav();
    window.addEventListener("resize", () => {
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(updateCompactNav);
    });

    toggle.addEventListener("click", () => {
        if (!nav) return;
        nav.classList.toggle("nav-open");
        const isOpen = nav.classList.contains("nav-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    if (list) {
        list.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("nav-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }
});

const hoverVideos = document.querySelectorAll(".project-video, .home-project-video");
if (hoverVideos.length) {
    hoverVideos.forEach(video => {
        const card = video.closest(".project-item") || video.closest(".home-project-card");
        if (!card) return;

        card.addEventListener("mouseenter", () => {
            video.play().catch(() => {});
        });
        card.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}
