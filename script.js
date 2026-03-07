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
    const modalContent = projectModal.querySelector(".project-modal-content");
    const modalText = projectModal.querySelector(".project-modal-text");
    const modalTitle = projectModal.querySelector(".project-modal-title");
    const modalCategory = projectModal.querySelector(".project-modal-category");
    const modalSkills = projectModal.querySelector(".project-modal-tags[data-kind=\"skills\"]");
    const modalTools = projectModal.querySelector(".project-modal-tags[data-kind=\"tools\"]");
    const modalLinksSection = projectModal.querySelector(".project-modal-links-section");
    const modalFigma = projectModal.querySelector(".project-modal-figma");
    const modalGithubCpp = projectModal.querySelector(".project-modal-github-cpp");
    const modalGithub = projectModal.querySelector(".project-modal-github-web");
    const modalWebsite = projectModal.querySelector(".project-modal-website");
    const modalTabs = Array.from(projectModal.querySelectorAll(".project-modal-tab"));
    const modalPanels = Array.from(projectModal.querySelectorAll(".project-modal-panel"));
    const modalBack = projectModal.querySelector(".project-modal-back");
    const modalNote = projectModal.querySelector(".project-modal-note");
    let modalRevealObserver = null;

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

    const getFieldIcon = (key) => {
        const icons = {
            "short-description": '<i class="bi bi-card-text project-overview-icon" aria-hidden="true"></i>',
            "project-type": '<i class="bi bi-window project-overview-icon" aria-hidden="true"></i>',
            "domain": '<i class="bi bi-globe2 project-overview-icon" aria-hidden="true"></i>',
            "format": '<i class="bi bi-phone project-overview-icon" aria-hidden="true"></i>',
            "key-features": '<i class="bi bi-stars project-overview-icon" aria-hidden="true"></i>',
            "purpose": '<i class="bi bi-bullseye project-overview-icon" aria-hidden="true"></i>',
            "user-value": '<i class="bi bi-person-check project-overview-icon" aria-hidden="true"></i>',
            "technical-objective": '<i class="bi bi-cpu project-overview-icon" aria-hidden="true"></i>',
            "design-objective": '<i class="bi bi-palette2 project-overview-icon" aria-hidden="true"></i>',
            "result": '<i class="bi bi-kanban project-overview-icon" aria-hidden="true"></i>',
            "my-role": '<i class="bi bi-person-badge project-overview-icon" aria-hidden="true"></i>'
        };

        return icons[key] || '<i class="bi bi-circle project-overview-icon" aria-hidden="true"></i>';
    };

    const animateModalContent = () => {
        const targets = Array.from(projectModal.querySelectorAll(
            ".project-modal-back, .project-modal-title, .project-modal-section, .project-modal-tabs, .project-modal-panels, .project-modal-note, .project-modal-panel.is-active, .project-overview-block, .project-overview-list li"
        ));
        if (!targets.length) return;

        if (modalRevealObserver) {
            modalRevealObserver.disconnect();
            modalRevealObserver = null;
        }

        targets.forEach(el => {
            el.classList.remove("is-visible");
            el.classList.add("project-modal-animate");
        });

        targets.forEach((el, index) => {
            const delay = Math.min(index * 45, 360);
            setTimeout(() => {
                el.classList.add("is-visible");
            }, delay);
        });
    };

    const setActiveTab = (targetTab) => {
        if (!targetTab) return;
        modalTabs.forEach(tab => {
            const isActive = tab.dataset.tab === targetTab;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });

        modalPanels.forEach(panel => {
            const isActive = panel.dataset.panel === targetTab;
            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });

        if (modalGallery) {
            const showGallery = false;
            modalGallery.classList.toggle("is-hidden", !showGallery);
        }

        if (modalNote) {
            const showNote = targetTab === "role";
            modalNote.classList.toggle("is-hidden", !showNote);
        }

    };

    if (modalTabs.length && modalPanels.length) {
        modalTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                setActiveTab(tab.dataset.tab || "overview");
            });
        });
    }

    const openModal = (item) => {
        const image = item.querySelector(".project_picture");
        const title = item.querySelector(".name_of_project");
        const details = item.querySelector(".project_description p:not(.project-meta)");
        const category = item.getAttribute("data-category") || "";
        const skills = (item.getAttribute("data-skills") || "").split(",");
        const tools = (item.getAttribute("data-tools") || "").split(" ");
        const overview = (item.getAttribute("data-overview") || "").trim();
        const overviewShort = (item.getAttribute("data-overview-short") || "").trim();
        const overviewType = (item.getAttribute("data-overview-type") || "").trim();
        const overviewDomain = (item.getAttribute("data-overview-domain") || "").trim();
        const overviewFormat = (item.getAttribute("data-overview-format") || "").trim();
        const overviewFeatures = (item.getAttribute("data-overview-features") || "").trim();
        const goal = (item.getAttribute("data-goal") || "").trim();
        const goalPurpose = (item.getAttribute("data-goal-purpose") || "").trim();
        const goalUserValue = (item.getAttribute("data-goal-user-value") || "").trim();
        const goalTechnical = (item.getAttribute("data-goal-technical") || "").trim();
        const goalDesign = (item.getAttribute("data-goal-design") || "").trim();
        const built = (item.getAttribute("data-built") || "").trim();
        const role = (item.getAttribute("data-role") || "").trim();
        const figma = (item.getAttribute("data-figma") || "").trim();
        const githubCpp = (item.getAttribute("data-github-cpp") || "").trim();
        const github = (item.getAttribute("data-github") || "").trim();
        const website = (item.getAttribute("data-website") || "").trim();
        const images = (item.getAttribute("data-images") || "")
            .split(",")
            .map(src => src.trim())
            .filter(Boolean);

        if (modalGallery) {
            clearNode(modalGallery);
            modalGallery.classList.add("is-hidden");
        }
        if (modalText) modalText.classList.remove("has-header-image");
        if (modalContent) modalContent.classList.remove("has-header-image");
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
        if (modalCategory) {
            modalCategory.textContent = category || "";
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
        if (modalFigma) {
            if (figma) {
                modalFigma.href = figma;
                modalFigma.style.display = "inline-flex";
            } else {
                modalFigma.removeAttribute("href");
                modalFigma.style.display = "none";
            }
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
        if (modalLinksSection) {
            const hasLinks = Boolean(figma || githubCpp || github || website);
            modalLinksSection.style.display = hasLinks ? "block" : "none";
        }

        const overviewText = overview || (details ? details.textContent.trim() : "");
        const overviewFields = [
            { key: "short-description", label: "Short Description", value: overviewShort || overviewText },
            { key: "project-type", label: "Project Type", value: overviewType || "Concept project" },
            { key: "domain", label: "Domain", value: overviewDomain || "Digital product" },
            { key: "format", label: "Format", value: overviewFormat || "Web and mobile" },
            { key: "key-features", label: "Key Features", value: overviewFeatures || overviewText }
        ];
        const panelCopy = {
            overview: overviewText,
            goal: goal || overviewText,
            built: built || overviewText,
            role: role || "I created this project independently."
        };
        modalPanels.forEach(panel => {
            const key = panel.dataset.panel || "overview";
            if (key === "overview") {
                panel.innerHTML = overviewFields
                    .map(field => {
                        if (field.label === "Key Features") {
                            const items = (field.value || "")
                                .split(/[;,]/)
                                .map(item => item.trim())
                                .filter(Boolean)
                                .map(item => `<li>${item}</li>`)
                                .join("");

                            return `
                                <div class="project-overview-block">
                                    <h5 class="project-overview-label">${getFieldIcon(field.key)} ${field.label}</h5>
                                    <ul class="project-overview-list">${items}</ul>
                                </div>
                            `;
                        }

                        return `
                            <div class="project-overview-block">
                                <h5 class="project-overview-label">${getFieldIcon(field.key)} ${field.label}</h5>
                                <p class="project-overview-text">${field.value}</p>
                            </div>
                        `;
                    })
                    .join("");
            } else if (key === "goal") {
                const goalText = panelCopy.goal || overviewText;
                const goalFields = [
                    { key: "purpose", label: "Purpose", value: goalPurpose || goalText },
                    { key: "user-value", label: "User Value", value: goalUserValue || "To provide a clear and useful experience for end users." },
                    { key: "technical-objective", label: "Technical Objective", value: goalTechnical || "To implement a stable solution aligned with project requirements." },
                    { key: "design-objective", label: "Design Objective", value: goalDesign || "To ensure the interface is clear, structured, and easy to use." }
                ];

                panel.innerHTML = goalFields
                    .map(field => `
                        <div class="project-overview-block">
                            <h5 class="project-overview-label">${getFieldIcon(field.key)} ${field.label}</h5>
                            <p class="project-overview-text">${field.value}</p>
                        </div>
                    `)
                    .join("");
            } else if (key === "built") {
                const resultImageSrc = images.length ? images[0] : (image ? image.src : "");
                const resultImageAlt = title ? `${title.textContent.trim()} result image` : "Project result image";

                panel.innerHTML = `
                    ${resultImageSrc ? `<img class="project-result-image" src="${resultImageSrc}" alt="${resultImageAlt}" loading="lazy">` : ""}
                `;
            } else {
                const panelText = panelCopy.role || overviewText;
                panel.innerHTML = `
                    <div class="project-overview-block">
                        <h5 class="project-overview-label">${getFieldIcon("my-role")} My Role</h5>
                        <p class="project-overview-text">${panelText}</p>
                    </div>
                `;
            }
        });

        if (modalNote) {
            modalNote.textContent = "This self-initiated concept project was created independently as part of my portfolio.";
        }
        setActiveTab("overview");

        projectModal.classList.add("is-open");
        projectModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        animateModalContent();
    };

    const closeModal = () => {
        projectModal.classList.remove("is-open");
        projectModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (modalRevealObserver) {
            modalRevealObserver.disconnect();
            modalRevealObserver = null;
        }
        projectModal.querySelectorAll(".project-modal-animate").forEach(el => {
            el.classList.remove("project-modal-animate", "is-visible");
        });
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

