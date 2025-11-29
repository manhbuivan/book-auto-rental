document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const contents = document.querySelectorAll(".step-content");
  let currentStep = 0;

  const showStep = (index) => {
    contents.forEach((c, i) => c.classList.toggle("active", i === index));
    steps.forEach((s, i) => {
      s.classList.toggle("active", i === index);

      const img = s.querySelector(".step-icon");
      if (i < index) {
        img.src = "assests/svg/checked.svg";
      } else if (i === index) {
        img.src = "assests/svg/checking.svg";
      } else {
        img.src = "assests/svg/un-check.svg";
      }
    });

    const lines = document.querySelectorAll(".line");
    const rootStyles = getComputedStyle(document.documentElement);
    const mainColor = rootStyles.getPropertyValue("--main-color").trim();
    const inactiveColor = "#BBBCBE";

    lines.forEach((line, i) => {
      line.style.backgroundColor = i < index ? mainColor : inactiveColor;
    });
  };

  async function callFindCarsAPI() {
    try {
      const payload = {
        passengers: 2,
        childSeats: 0,
        boosterSeats: 0,
        distance: 10,
        pickupDistance: 5,
        returnDistance: 5,
        isRoundTrip: true,
        outboundPickupDateTime: "2025-12-12T00:00:00.000Z",
        returnPickupDateTime: "2025-12-15T00:00:00.000Z",
      };

      const res = await fetch(
        "https://machshuttle.hayho.org/api/cars/find-by-seats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Client-Timezone-Offset": new Date().getTimezoneOffset() + "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        alert("Call API lỗi: " + errorText);
        return;
      }

      const data = await res.json();
      renderCars(data.data);

      console.log("API Data:", data);

      // 👉 Nếu bạn muốn fill data xe vào step 2, để tôi viết luôn
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }

  function renderCars(list) {
    const container = document.getElementById("carList");
    container.innerHTML = ""; // clear danh sách cũ

    list.forEach((car, index) => {
      container.innerHTML += `
      <label class="car-card-item">
        <input type="radio" name="selectedCar" class="car-checkbox" ${
          index === 0 ? "checked" : ""
        } />

        <img src="${car.image || "assests/png/urus_1.png"}" class="car-image" />

        <div class="car-info">
          <h3 class="car-name">${car.name}</h3>
          <div class="car-details">
            <span><img src="assests/svg/seat.svg" /> ${car.seats} Seats</span>
            <span><img src="assests/svg/auto.svg" /> Auto</span>
            <span><img src="assests/svg/bag.svg" /> ${car.bags} Bags</span>
          </div>
          <p class="car-desc">Carries up to ${car.seats} passengers.</p>
        </div>

        <div class="car-price">
          <span>$${car.price}</span>
          <div class="radio"></div>
        </div>
      </label>
    `;
    });
  }

  // Next buttons
  document.getElementById("nextBtn").addEventListener("click", async () => {
    await callFindCarsAPI();
    if (currentStep < contents.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  document.getElementById("nextToPayment").addEventListener("click", () => {
    if (currentStep < contents.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  // Back buttons
  document.getElementById("backBtn1").addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    showStep(currentStep);
  });

  document.getElementById("backBtn2").addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    showStep(currentStep);
  });

  // ============== Add stop logic ================

  const dropoffList = document.getElementById("dropoffList");
  const addStopBtn = document.getElementById("addStop");

  function updateNumbers() {
    const items = dropoffList.querySelectorAll(".dropoff-item");
    items.forEach((item, index) => {
      const circle = item.querySelector(".circle-number");
      if (circle) circle.textContent = index + 1;
    });
  }

  addStopBtn.addEventListener("click", () => {
    const items = dropoffList.querySelectorAll(".dropoff-item");

    // Nếu là lần add đầu tiên → thêm số cho dòng đầu tiên (nhưng KHÔNG thêm nút trừ)
    if (items.length === 1 && !items[0].querySelector(".circle-number")) {
      const first = items[0];
      const wrapper = first.querySelector(".input-wrapper");
      wrapper.classList.add("has-number");
      wrapper.insertAdjacentHTML(
        "afterbegin",
        `<span class="circle-number">1</span>`
      );
    }

    // Tạo ô mới
    const index = items.length + 1;
    const newItem = document.createElement("div");
    newItem.className = "dropoff-item d-flex align-items-center adding";
    newItem.innerHTML = `
    <div class="input-wrapper position-relative flex-grow-1 has-number">
      <span class="circle-number">${index}</span>
      <input
        type="text"
        class="form-control dropoff-input"
        placeholder="Enter Address, Point of Interest or Airpod Code"
      />
    </div>
    <button type="button" class="btn remove-btn">−</button>
  `;

    dropoffList.appendChild(newItem);

    // Kích hoạt animation
    requestAnimationFrame(() => {
      newItem.classList.add("show");
      newItem.classList.remove("adding");
    });

    updateNumbers();
  });

  // Xóa dòng
  dropoffList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const item = e.target.closest(".dropoff-item");
      const items = Array.from(dropoffList.querySelectorAll(".dropoff-item"));
      const index = items.indexOf(item);

      if (index === 0) return;

      item.classList.add("removing");
      item.addEventListener(
        "transitionend",
        () => {
          item.remove();

          const remaining = dropoffList.querySelectorAll(".dropoff-item");
          if (remaining.length === 1) {
            const first = remaining[0];
            first.querySelector(".circle-number")?.remove();
            first.querySelector(".remove-btn")?.remove();
            first
              .querySelector(".input-wrapper")
              .classList.remove("has-number");
          }

          updateNumbers();
        },
        { once: true }
      );
    }
  });

  showStep(currentStep);
});
