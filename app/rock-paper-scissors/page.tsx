"use client";

import React from "react";
import { useResponsive } from "@/contexts/ResponsiveContext";

export default function Page() {
  const { deviceType } = useResponsive();

  return (
    <main className="h-full w-full bg-white text-black overflow-hidden px-2 md:px-4 pt-4 pb-4">
      <section className="mx-auto max-w-4xl h-full flex flex-col">
        <style>{`
@import url('https://fonts.googleapis.com/css?family=Acme&display=swap');
@keyframes changeOrder {
  from { z-index: 9;}
  to { z-index: 1; }
}
@keyframes handShake {
  0%,100% { transform: rotate(10deg); }
  50% { transform: rotate(-10deg); }
}
@keyframes handShake2 {
  0%,100% { transform: rotateY(180deg) rotate(10deg); }
  50% { transform: rotateY(180deg) rotate(-10deg); }
}
html, body {
  margin: 0;
  padding: 0;
  border: 0;
  line-height: 1;
  font-family: Acme, Arial, sans-serif;
}
.rps-form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
h1 {
  text-align: center;
}
#hands {
  text-align: center;
}
.rps-form input:checked ~ div .hand {
  animation: none !important;
}
.hand {
  margin: 10px;
  width: ${
    deviceType === "mobile"
      ? "120px"
      : deviceType === "tablet"
      ? "160px"
      : "200px"
  };
  height: ${
    deviceType === "mobile"
      ? "120px"
      : deviceType === "tablet"
      ? "160px"
      : "200px"
  };
  position: relative;
  transform: rotate(10deg);
  display: inline-block;
  animation: handShake 2s infinite;
}
.hand > div {
  position: absolute;
  box-sizing: border-box;
  border: 2px solid black;
  background: gold;
  transition: all 0.1s;
}
.fist {
  height: ${
    deviceType === "mobile"
      ? "70px"
      : deviceType === "tablet"
      ? "90px"
      : "110px"
  };
  left: ${
    deviceType === "mobile" ? "25px" : deviceType === "tablet" ? "35px" : "40px"
  };
  top: ${
    deviceType === "mobile" ? "30px" : deviceType === "tablet" ? "40px" : "50px"
  };
  width: ${
    deviceType === "mobile" ? "60px" : deviceType === "tablet" ? "70px" : "90px"
  };
  border-radius: 20px 0 0 20px;
}
.finger {
  width: ${
    deviceType === "mobile" ? "50px" : deviceType === "tablet" ? "60px" : "70px"
  };
  height: ${
    deviceType === "mobile" ? "20px" : deviceType === "tablet" ? "25px" : "30px"
  };
  border-radius: 20px;
  left: ${
    deviceType === "mobile" ? "60px" : deviceType === "tablet" ? "70px" : "80px"
  };
  transform-origin: 0 50%;
}
.finger-1 { top: ${
          deviceType === "mobile"
            ? "30px"
            : deviceType === "tablet"
            ? "40px"
            : "50px"
        }; --dif: 0px; }
.finger-2 { top: ${
          deviceType === "mobile"
            ? "50px"
            : deviceType === "tablet"
            ? "65px"
            : "78px"
        }; left: ${
          deviceType === "mobile"
            ? "64px"
            : deviceType === "tablet"
            ? "74px"
            : "84px"
        }; --dif: 4px; }
.finger-3 { top: ${
          deviceType === "mobile"
            ? "70px"
            : deviceType === "tablet"
            ? "90px"
            : "106px"
        }; --dif: 0px; }
.finger-4 { top: ${
          deviceType === "mobile"
            ? "90px"
            : deviceType === "tablet"
            ? "115px"
            : "134px"
        }; height: ${
          deviceType === "mobile"
            ? "18px"
            : deviceType === "tablet"
            ? "22px"
            : "26px"
        }; left: ${
          deviceType === "mobile"
            ? "56px"
            : deviceType === "tablet"
            ? "66px"
            : "76px"
        }; --dif: -8px; }
div.thumb {
  width: ${
    deviceType === "mobile" ? "25px" : deviceType === "tablet" ? "30px" : "35px"
  };
  height: ${
    deviceType === "mobile" ? "50px" : deviceType === "tablet" ? "60px" : "70px"
  };
  border-radius: 0 20px 20px 20px;
  top: ${
    deviceType === "mobile" ? "30px" : deviceType === "tablet" ? "40px" : "50px"
  };
  left: ${
    deviceType === "mobile" ? "60px" : deviceType === "tablet" ? "70px" : "80px"
  };
  border-left: 0 solid;
  box-shadow: -17px 6px 0 -15px black;
}
div.arm {
  width: ${
    deviceType === "mobile" ? "18px" : deviceType === "tablet" ? "20px" : "22px"
  };
  height: ${
    deviceType === "mobile" ? "50px" : deviceType === "tablet" ? "60px" : "70px"
  };
  left: ${
    deviceType === "mobile" ? "15px" : deviceType === "tablet" ? "18px" : "20px"
  };
  top: ${
    deviceType === "mobile" ? "40px" : deviceType === "tablet" ? "50px" : "70px"
  };
  border: 0;
  border-top: 2px solid black;
  border-bottom: 2px solid black;
}
#user-hand {
  transform: rotateY(180deg);
  animation: handShake2 2s infinite;
  position: relative;
}
.rps-form input[type="radio"] {
  position: absolute;
  top: -1000in;
  left: -1000in;
}
.rps-form input[id$="scissors"]:checked ~ div #user-hand .finger-1,
.rps-form input[id^="scissors"]:checked ~ div #computer-hand .finger-1 {
  width: ${
    deviceType === "mobile"
      ? "90px"
      : deviceType === "tablet"
      ? "110px"
      : "130px"
  };
  transform:rotate(-5deg);
}
.rps-form input[id$="scissors"]:checked ~ div #user-hand .finger-2,
.rps-form input[id^="scissors"]:checked ~ div #computer-hand .finger-2 {
  width: ${
    deviceType === "mobile"
      ? "90px"
      : deviceType === "tablet"
      ? "110px"
      : "130px"
  };
  transform:rotate(5deg);
}
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-1,
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-2,
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-3,
.rps-form input[id$="paper"]:checked ~ div #user-hand .finger-4,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-1,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-2,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-3,
.rps-form input[id^="paper"]:checked ~ div #computer-hand .finger-4 {
  left: ${
    deviceType === "mobile"
      ? "94px"
      : deviceType === "tablet"
      ? "104px"
      : "124px"
  };
  left: calc(${
    deviceType === "mobile"
      ? "94px"
      : deviceType === "tablet"
      ? "104px"
      : "124px"
  } + var(--dif));
  width: ${
    deviceType === "mobile" ? "60px" : deviceType === "tablet" ? "70px" : "80px"
  };
  border-left: 0;
  border-radius: 0 20px 20px 0;
}
#rock-rock:checked ~ div h2::before,
#paper-paper:checked ~ div h2::before,
#scissors-scissors:checked ~ div h2::before {
  content: "You Tied!";
}
#rock-paper:checked ~ div h2::before,
#paper-scissors:checked ~ div h2::before,
#scissors-rock:checked ~ div h2::before {
  content: "You Win!";
}
#rock-scissors:checked ~ div h2::before,
#paper-rock:checked ~ div h2::before,
#scissors-paper:checked ~ div h2::before {
  content: "Computer Wins!";
}
#message {
  text-align: center;
  display: none;
}
.rps-form input:checked ~ #message {
  display: block;
}
#hands {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${deviceType === "mobile" ? "column" : "row"};
  gap: ${deviceType === "mobile" ? "20px" : "0"};
}
#icons {
  width: ${deviceType === "mobile" ? "150px" : "30px"};
  height: ${deviceType === "mobile" ? "30px" : "200px"};
  display: inline-flex;
  flex-direction: ${deviceType === "mobile" ? "row" : "column"};
}
#icons > div {
  flex: 1;
  align-items: center;
  justify-content: center;
  width: ${deviceType === "mobile" ? "40px" : "60px"};
  height: ${deviceType === "mobile" ? "40px" : "60px"};
  overflow: hidden;
  position: relative;
}
label:active {
  position:static; 
  margin-left: ${deviceType === "mobile" ? "40px" : "60px"};
}
label:active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: ${deviceType === "mobile" ? "40px" : "60px"};
  z-index: 10;
  height: ${deviceType === "mobile" ? "40px" : "60px"};
}
label {
  animation: changeOrder 0.45s infinite linear;
  background: #f5f5f5;
  border: 1px solid #ccc;
  box-sizing: border-box;
  cursor: pointer;
  display: block;
  height: ${deviceType === "mobile" ? "40px" : "60px"};
  width: ${deviceType === "mobile" ? "40px" : "60px"};
  line-height: ${deviceType === "mobile" ? "40px" : "60px"};
  font-size: ${deviceType === "mobile" ? "1.5rem" : "2rem"};
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
}
label:nth-of-type(1) { animation-delay: -0.00s; }
label:nth-of-type(2) { animation-delay: -0.15s; }
label:nth-of-type(3) { animation-delay: -0.30s; }
        `}</style>

        <form className="rps-form mt-12 flex-1 flex flex-col">
          <input type="radio" id="rock-rock" name="rock-paper-scissors" />
          <input type="radio" id="rock-paper" name="rock-paper-scissors" />
          <input type="radio" id="rock-scissors" name="rock-paper-scissors" />
          <input type="radio" id="paper-rock" name="rock-paper-scissors" />
          <input type="radio" id="paper-paper" name="rock-paper-scissors" />
          <input type="radio" id="paper-scissors" name="rock-paper-scissors" />
          <input type="radio" id="scissors-rock" name="rock-paper-scissors" />
          <input type="radio" id="scissors-paper" name="rock-paper-scissors" />
          <input
            type="radio"
            id="scissors-scissors"
            name="rock-paper-scissors"
          />

          <div className="-mt-23 flex flex-col">
            <h1
              className={`text-center mb-4 md:mb-6 ${
                deviceType === "mobile"
                  ? "text-xl"
                  : deviceType === "tablet"
                  ? "text-2xl"
                  : "text-4xl"
              }`}
            >
              CSS Rock-Paper-Scissors
            </h1>
            <div
              id="hands"
              className="items-center justify-center gap-4 md:gap-8"
            >
              <div className="hand" id="computer-hand">
                <div className="fist"></div>
                <div className="finger finger-1"></div>
                <div className="finger finger-2"></div>
                <div className="finger finger-3"></div>
                <div className="finger finger-4"></div>
                <div className="thumb"></div>
                <div className="arm"></div>
              </div>

              <div className="hand" id="user-hand">
                <div className="fist"></div>
                <div className="finger finger-1"></div>
                <div className="finger finger-2"></div>
                <div className="finger finger-3"></div>
                <div className="finger finger-4"></div>
                <div className="thumb"></div>
                <div className="arm"></div>
              </div>

              <div
                id="icons"
                className={`${
                  deviceType === "mobile" ? "w-40 h-10" : "w-30 h-200"
                } flex ${deviceType === "mobile" ? "flex-row" : "flex-col"}`}
              >
                <div className="flex-1 flex items-center justify-center relative">
                  <label
                    htmlFor="rock-rock"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    ✊
                  </label>
                  <label
                    htmlFor="paper-rock"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    ✊
                  </label>
                  <label
                    htmlFor="scissors-rock"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    ✊
                  </label>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <label
                    htmlFor="rock-paper"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    🖐️
                  </label>
                  <label
                    htmlFor="paper-paper"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    🖐️
                  </label>
                  <label
                    htmlFor="scissors-paper"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    🖐️
                  </label>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <label
                    htmlFor="rock-scissors"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    ✌
                  </label>
                  <label
                    htmlFor="paper-scissors"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    ✌
                  </label>
                  <label
                    htmlFor="scissors-scissors"
                    className={
                      deviceType === "mobile"
                        ? "text-xl"
                        : "text-2xl md:text-3xl"
                    }
                  >
                    ✌
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div id="message" className="mt-22 md:mt-4">
            <h2
              className={`text-center ${
                deviceType === "mobile"
                  ? "text-lg"
                  : deviceType === "tablet"
                  ? "text-xl"
                  : "text-2xl"
              }`}
            ></h2>
            <input
              type="reset"
              value="Refresh Round (Click to restart)"
              className="mt-4 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 md:px-4 md:py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-400 active:translate-y-[1px] active:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            />
          </div>
        </form>
      </section>
    </main>
  );
}
