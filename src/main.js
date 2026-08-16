import "./style.css";
import studyFoxLogo from "./assets/studyfox-logo.png";
import crystalImage from "./assets/crystal.png";
import paperPlaneImage from "./assets/paper-plane.png";
import giftBoxImage from "./assets/gift-box.png";
import mysteryBoxImage from "./assets/mystery-box.png";
import progressIcon from "./assets/progress-icon-v2.png";
import homeworkIcon from "./assets/homework-icon.png";
import vocabularyIcon from "./assets/vocabulary-icon.png";
import speakingIcon from "./assets/speaking-icon.png";
import readingIcon from "./assets/reading-icon.png";
import listeningIcon from "./assets/listening-icon.png";
import writingIcon from "./assets/writing-icon.png";
import attendanceIcon from "./assets/attendance-icon.png";
import foxMascot from "./assets/fox-mascot.png";
import foxPaw from "./assets/fox-paw.png";
import shineNav from "./assets/shine-nav.png";
import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
  increment,
} from "firebase/firestore";

const app = document.querySelector("#app");

function renderLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="brand-badge">SF</div>

        <h1>StudyFox</h1>
        <p class="login-subtitle">
          Your progress. Your rewards. Your journey.
        </p>

        <div class="login-form">
          <label>
            <span>Login</span>
            <input
              id="email"
              type="email"
              placeholder="Enter your login"
            >
          </label>

          <label>
            <span>Password</span>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            >
          </label>

          <button id="loginButton" class="primary-button">
            Log in
          </button>

          <p id="message" class="login-message"></p>
        </div>
      </section>
    </main>
  `;

  document
    .querySelector("#loginButton")
    .addEventListener("click", login);
}

async function login() {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const message = document.querySelector("#message");

  message.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    message.textContent = "Login failed. Check your login and password.";
  }
}

async function loadStudentDashboard(user) {
  try {
    const userSnap = await getDoc(
      doc(db, "users", user.uid)
    );

    if (!userSnap.exists()) {
      app.innerHTML = "<p>User profile not found.</p>";
      return;
    }

    const userData = userSnap.data();

    if (userData.role !== "student") {
      app.innerHTML = "<p>This account is not a student account.</p>";
      return;
    }

    const studentSnap = await getDoc(
      doc(db, "students", userData.studentId)
    );

    if (!studentSnap.exists()) {
      app.innerHTML = "<p>Student data not found.</p>";
      return;
    }

    const student = studentSnap.data();

    const monthsSnap = await getDocs(
  collection(db, "students", userData.studentId, "months")
);

const months = monthsSnap.docs.map((monthDoc) => ({
  id: monthDoc.id,
  ...monthDoc.data(),
}));
const lessonsSnap = await getDocs(
  collection(
    db,
    "students",
    userData.studentId,
    "lessons"
  )
);

const lessons = lessonsSnap.docs.map((lessonDoc) => ({
  id: lessonDoc.id,
  ...lessonDoc.data(),
}));

lessons.sort((a, b) =>
  (b.date || "").localeCompare(a.date || "")
);
renderDashboard({
  studentId: userData.studentId,
  displayName: userData.displayName,
  months,
  lessons,
  ...student,
});

  } catch (error) {
    console.error(error);
    app.innerHTML = "<p>Could not load student data.</p>";
  }
}
let selectedMonthIndex = 0;
function renderCrystalHistory(student) {
  const lessons = (student.lessons || []).filter(
  (lesson) => lesson.date
);

  app.innerHTML = `
    <main class="dashboard">
      <section class="dashboard-section">

        <button id="backToDashboardButton">
          ← Back
        </button>

        <p class="section-label">MY CRYSTALS</p>
        <h1>Crystal History 💎</h1>

        <p>
          See what you earned in each lesson.
        </p>

        <div class="crystal-history-list">
          ${
            lessons.length
              ? lessons
                  .map(
                    (lesson) => `
                      <div class="crystal-history-item">

                        <div>
                          <strong>
  ${new Date(lesson.date + "T00:00:00").toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })}
</strong>
                        </div>

                        <strong>
                          +${Number(lesson.crystalsEarned ?? 0)} 💎
                        </strong>

                        <div class="crystal-reasons">
                          ${
                            lesson.homework
                              ? "<span>✓ Homework</span>"
                              : ""
                          }

                          ${
                            lesson.englishOnly
                              ? "<span>✓ English Only</span>"
                              : ""
                          }

                          ${
                            lesson.classRules
                              ? "<span>✓ Class Rules</span>"
                              : ""
                          }
                        </div>

                      </div>
                    `
                  )
                  .join("")
              : "<p>No lessons yet.</p>"
          }
        </div>

      </section>
    </main>
  `;

  document
    .querySelector("#backToDashboardButton")
    .addEventListener("click", () => {
      renderDashboard(student);
    });
}
function renderGiftBox(student) {
  const prizes = [
    "Pen",
    "Pencil",
    "Notebook",
    "Eraser",
    "Pencil Sharpener",
    "Ruler",
    "Surprise"
  ];

  app.innerHTML = `
    <main class="dashboard">
      <section class="dashboard-section">

        <button id="backToDashboardButton">
          ← Back
        </button>

        <p class="card-kicker">GIFT BOX</p>
        <h1>Gift Box 🎁</h1>

        <p>
          Your balance: ${student.crystalBalance ?? 0} 💎
        </p>

        <div class="gift-box-area">
          <div class="gift-box-icon">🎁</div>

          <h2>What's inside?</h2>

          <p>
            Open the Gift Box and discover your prize!
          </p>

          <button id="openGiftBoxButton" type="button">
            Open Gift Box · 15 💎
          </button>
        </div>

        <p id="giftBoxMessage"></p>

      </section>
    </main>
  `;

  document
    .querySelector("#backToDashboardButton")
    .addEventListener("click", () => {
      renderDashboard(student);
    });

  document
    .querySelector("#openGiftBoxButton")
    .addEventListener("click", async () => {
      const balance = Number(student.crystalBalance ?? 0);
      const message = document.querySelector("#giftBoxMessage");

      if (balance < 15) {
        message.textContent =
          `You need ${15 - balance} more crystals 💎`;
        return;
      }

      const randomPrize =
        prizes[Math.floor(Math.random() * prizes.length)];

      message.textContent = "Opening...";

      try {
        const batch = writeBatch(db);

        const studentRef = doc(
          db,
          "students",
          student.studentId
        );

        const redemptionRef = doc(
          collection(
            db,
            "students",
            student.studentId,
            "redemptions"
          )
        );

        batch.update(studentRef, {
          crystalBalance: increment(-15),
        });

        batch.set(redemptionRef, {
          rewardId: "gift_box",
          rewardType: "Gift Box",
          prize: randomPrize,
          cost: 15,
          openedAt: new Date(),
          claimed: false,
        });

        await batch.commit();

        student.crystalBalance =
          Number(student.crystalBalance ?? 0) - 15;

        message.innerHTML = `
          <strong>You won: ${randomPrize}! 🎉</strong>
          <br>
          15 💎 spent. Balance: ${student.crystalBalance} 💎
        `;

      } catch (error) {
        console.error(error);
        message.textContent = "Could not open Gift Box.";
      }
    });
}


function renderMysteryBox(student) {
  app.innerHTML = `
    <main class="dashboard">
      <section class="dashboard-section">

        <button id="backToDashboardButton">
          ← Back
        </button>

        <p class="card-kicker">MYSTERY BOX</p>
        <h1>Mystery Box 🎁</h1>

        <p>
          Your balance: ${student.crystalBalance ?? 0} 💎
        </p>

        <div class="gift-box-area">
          <div class="gift-box-icon">🎁</div>

          <h2>Ready for a mystery?</h2>

          <p>
            Open the Mystery Box to reveal your special reward!
          </p>

          <button id="openMysteryBoxButton" type="button">
            Open Mystery Box · 30 💎
          </button>
        </div>

        <p id="mysteryBoxMessage"></p>

      </section>
    </main>
  `;

  document
    .querySelector("#backToDashboardButton")
    .addEventListener("click", () => {
      renderDashboard(student);
    });

  document
    .querySelector("#openMysteryBoxButton")
    .addEventListener("click", async () => {
      const balance = Number(student.crystalBalance ?? 0);
      const message = document.querySelector("#mysteryBoxMessage");

      if (balance < 30) {
        message.textContent =
          `You need ${30 - balance} more crystals 💎`;
        return;
      }

      message.textContent = "Opening...";

      try {
        const batch = writeBatch(db);

        const studentRef = doc(
          db,
          "students",
          student.studentId
        );

        const redemptionRef = doc(
          collection(
            db,
            "students",
            student.studentId,
            "redemptions"
          )
        );

        batch.update(studentRef, {
          crystalBalance: increment(-30),
        });

        batch.set(redemptionRef, {
          rewardId: "mystery_box",
          rewardType: "Mystery Box",
          cost: 30,
          openedAt: new Date(),
          claimed: false,
        });

        await batch.commit();

        student.crystalBalance =
          Number(student.crystalBalance ?? 0) - 30;

        message.innerHTML = `
          <strong>Mystery Box opened! 🎉</strong>
          <br>
          30 💎 spent. Balance: ${student.crystalBalance} 💎
        `;

      } catch (error) {
        console.error(error);
        message.textContent = "Could not open Mystery Box.";
      }
    });
}
function renderDashboard(student) {
  const sortedMonths = [...(student.months || [])].sort(
  (a, b) => b.id.localeCompare(a.id)
);

if (selectedMonthIndex >= sortedMonths.length) {
  selectedMonthIndex = 0;
}

const selectedMonth = sortedMonths[selectedMonthIndex] || null;
  app.innerHTML = `
    <main class="dashboard-page">
    <div class="decor decor-left"></div>
<div class="decor decor-right"></div>
      <div class="dashboard-shell">

        <header class="dashboard-header">
          <div>
           <div class="studyfox-brand">
  <img
    src="${studyFoxLogo}"
    alt="StudyFox"
    class="studyfox-logo"
  />
  <span class="studyfox-brand-label">STUDENT TRACKER</span>
</div>
            <div class="student-greeting">
  <h1>Hi, ${student.displayName}!</h1>
<img src="${foxPaw}" alt="" class="greeting-paw" />
</div>
            <p class="student-group">${student.groupName}</p>
          </div>

          <button id="logoutButton" class="logout-button">
            Log out
          </button>
        </header>

        <section class="balance-card">
          <div>
            <p class="balance-label">MY CRYSTALS</p>
            <div class="balance-number">
  <img
    src="${crystalImage}"
    alt="Crystal"
    class="balance-crystal"
  />
  <span>${student.crystalBalance}</span>
</div>
          </div>

          <div class="crystal-journey">
  <span class="journey-text">
    Keep going — every lesson counts.
  </span>

  <div class="journey-path">
    <span class="journey-star">✦</span>
    <span class="journey-dots"></span>

    <img
      src="${paperPlaneImage}"
      alt=""
      class="journey-plane"
    />
  </div>
</div>
          <button id="crystalHistoryButton" class="secondary-button">
  Crystal History
</button>
        </section>

        <section class="dashboard-grid">

          <article class="dashboard-card">
            <div class="card-heading">
              <div>
                <p class="card-kicker">PROGRESS</p>
                <h2>My Progress</h2>
              </div>
              <img
  src="${progressIcon}"
  alt="Progress"
  class="card-icon-image"
/>
            </div>

            <p class="card-description">
  Track your English skills month by month.
</p>

<div class="progress-month">
 ${
  selectedMonth
    ? (() => {
        const month = selectedMonth;
            const homework = Number(month.homework ?? 0);
            const vocabulary = Number(month.vocabulary ?? 0);
            const speaking = Number(month.speaking ?? 0);
            const reading = Number(month.reading ?? 0);
            const listening = Number(month.listening ?? 0);
            const writing = Number(month.writing ?? 0);

            const overall = Math.round(
              (
                homework +
                vocabulary +
                speaking +
                reading +
                listening +
                writing
              ) / 6
            );

            const classesHeld = Number(month.classesHeld ?? 0);
            const classesAttended = Number(month.classesAttended ?? 0);

            const attendance =
              classesHeld > 0
                ? Math.round((classesAttended / classesHeld) * 100)
                : 0;

            return `
              <div class="progress-panel">

                <div class="progress-topline">
  <div class="month-selector">
    <p class="progress-label">MONTH</p>

    <div class="month-navigation">
      <button
        id="prevMonthButton"
        class="month-nav-button"
        ${selectedMonthIndex >= sortedMonths.length - 1 ? "disabled" : ""}
      >
        ‹
      </button>

      <h3>
        ${new Date(month.id + "-01").toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        })}
      </h3>

      <button
        id="nextMonthButton"
        class="month-nav-button"
        ${selectedMonthIndex <= 0 ? "disabled" : ""}
      >
        ›
      </button>
    </div>
  </div>

                  <div class="overall-score">
                    <span>Overall</span>
                    <strong>${overall}%</strong>
                  </div>
                </div>

<div class="skill-list">

  <div class="skill-row">
    <div class="skill-info">
      <div class="skill-name">
        <img src="${homeworkIcon}" class="skill-image" alt="" />
        <span>Homework</span>
      </div>
      <strong>${homework}%</strong>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${homework}%"></div>
    </div>
  </div>

  <div class="skill-row">
    <div class="skill-info">
      <div class="skill-name">
        <img src="${vocabularyIcon}" class="skill-image" alt="" />
        <span>Vocabulary</span>
      </div>
      <strong>${vocabulary}%</strong>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${vocabulary}%"></div>
    </div>
  </div>

  <div class="skill-row">
    <div class="skill-info">
      <div class="skill-name">
       <img src="${speakingIcon}" class="skill-image" alt="" />
        <span>Speaking</span>
      </div>
      <strong>${speaking}%</strong>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${speaking}%"></div>
    </div>
  </div>

  <div class="skill-row">
    <div class="skill-info">
      <div class="skill-name">
        <img src="${readingIcon}" class="skill-image" alt="" />
        <span>Reading</span>
      </div>
      <strong>${reading}%</strong>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${reading}%"></div>
    </div>
  </div>

  <div class="skill-row">
    <div class="skill-info">
      <div class="skill-name">
        <img src="${listeningIcon}" class="skill-image" alt="" />
        <span>Listening</span>
      </div>
      <strong>${listening}%</strong>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${listening}%"></div>
    </div>
  </div>

  <div class="skill-row">
    <div class="skill-info">
      <div class="skill-name">
        <img src="${writingIcon}" class="skill-image" alt="" />
        <span>Writing</span>
      </div>
      <strong>${writing}%</strong>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${writing}%"></div>
    </div>
  </div>

</div>

<div class="attendance-block">
  <div class="skill-info">
    <div class="skill-name">
      <img src="${attendanceIcon}" class="skill-image" alt="" />
      <span>Class Attendance</span>
    </div>
    <strong>${attendance}%</strong>
  </div>

  <div class="progress-track attendance-track">
    <div
      class="progress-fill"
      style="width:${attendance}%"
    ></div>
  </div>
</div>

                <div class="teacher-comment">
                  <p class="progress-label">TEACHER COMMENT</p>
                  <p>
                    ${
                      month.teacherComment
                        ? month.teacherComment
                        : "No comment yet."
                    }
                  </p>
                </div>

              </div>
           `;
})()
: "<p>No progress data yet.</p>"
  }
</div>
          </article>

          <article class="dashboard-card">
            <div class="card-heading">
              <div>
                <p class="card-kicker">REWARDS</p>
                <h2>My Rewards</h2>
              </div>
              <span class="card-icon rewards-icon">
  <img src="${shineNav}" alt="" class="rewards-heading-image" />
</span>
            </div>

            <p class="card-description">
              Collect crystals and unlock special prizes.
            </p>

            <button
  class="reward-preview reward-button reward-card"
  id="giftBoxButton"
  type="button"
>
  <img
    src="${giftBoxImage}"
    alt="Gift Box"
    class="reward-image"
  />

  <div class="reward-info">
    <span class="reward-title">Gift Box</span>

    <span class="reward-cost">
      15
      <img
        src="${crystalImage}"
        alt=""
        class="reward-crystal"
      />
    </span>
  </div>

  <span class="reward-arrow">›</span>
</button>

<button
  class="reward-preview reward-button reward-card"
  id="mysteryBoxButton"
  type="button"
>
  <img
    src="${mysteryBoxImage}"
    alt="Mystery Box"
    class="reward-image"
  />

  <div class="reward-info">
    <span class="reward-title">Mystery Box</span>

    <span class="reward-cost">
      30
      <img
        src="${crystalImage}"
        alt=""
        class="reward-crystal"
      />
    </span>
  </div>

  <span class="reward-arrow">›</span>
</button>
          </article>

        </section>
      </div>
      <img
  src="${foxMascot}"
  alt="StudyFox fox"
  class="fox-mascot"
/>
    </main>
  `;

  document
    .querySelector("#logoutButton")
    .addEventListener("click", async () => {
      await signOut(auth);
    });
    const prevMonthButton = document.querySelector("#prevMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");

if (prevMonthButton) {
  prevMonthButton.addEventListener("click", () => {
    if (selectedMonthIndex < sortedMonths.length - 1) {
      selectedMonthIndex++;
      renderDashboard(student);
    }
  });
}

if (nextMonthButton) {
  nextMonthButton.addEventListener("click", () => {
    if (selectedMonthIndex > 0) {
      selectedMonthIndex--;
      renderDashboard(student);
    }
  });
}
const crystalHistoryButton =
  document.querySelector("#crystalHistoryButton");

if (crystalHistoryButton) {
  crystalHistoryButton.addEventListener("click", () => {
    renderCrystalHistory(student);
  });
}
const giftBoxButton =
  document.querySelector("#giftBoxButton");

if (giftBoxButton) {
  giftBoxButton.addEventListener("click", () => {
    const balance = Number(student.crystalBalance ?? 0);

    if (balance < 15) {
      alert(`You need ${15 - balance} more crystals 💎`);
      return;
    }

    renderGiftBox(student);
  });
}
const mysteryBoxButton =
  document.querySelector("#mysteryBoxButton");

if (mysteryBoxButton) {
  mysteryBoxButton.addEventListener("click", () => {
    const balance = Number(student.crystalBalance ?? 0);

    if (balance < 30) {
      alert(`You need ${30 - balance} more crystals 💎`);
      return;
    }

    renderMysteryBox(student);
  });
}
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadStudentDashboard(user);
  } else {
    renderLogin();
  }
});