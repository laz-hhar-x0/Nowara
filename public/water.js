
    
    
    
    
    
    // إعداد Firebase
      const firebaseConfig = {
          apiKey: "AIzaSyAGry9R0aDWFYEawM4VsQOZO-jCS9Dk2wM",
          authDomain: "lazhar-app.firebaseapp.com",
          databaseURL: "https://lazhar-app-default-rtdb.firebaseio.com",
          projectId: "lazhar-app",
          storageBucket: "lazhar-app.appspot.com",
          messagingSenderId: "18352349338",
          appId: "1:18352349338:web:673d8a7e2eebe3db26bf23"
      };

      // تهيئة Firebase
      firebase.initializeApp(firebaseConfig);
      const db = firebase.database();

      document.addEventListener('DOMContentLoaded', () => {
          // عناصر التحكم
          const waterInput = document.getElementById('waterInput');
          const powerBtn = document.getElementById("powerBtn");
          const powerImg = document.getElementById("powerImg");
          const powerText = document.getElementById("powerText");
          const autoIcon = document.getElementById("autoIcon");
          const autoImg = document.getElementById("autoImg");
          const autoText = document.getElementById("autoText");
          const waterLevel = document.querySelector(".water-level");
          const zoneElements = document.querySelectorAll(".zone");

          // حالة النظام الافتراضية
          let isAuto = false;
          let isWaterOn = true; // النظام يعمل عند البدء

          // تحديث واجهة المستخدم بناءً على حالة النظام
         function updateUI() {
              powerImg.src = isWaterOn ? "power-red.png" : "power-green.png";
              powerText.textContent = isWaterOn ? "إيقاف" : "تشغيل";
              
              autoImg.src = isAuto ? "autoBlack.png" : "autoBlue.png";
              autoText.textContent = isAuto ? "يدوي" : "تلقائي";
              autoText.style.color = isAuto ? "black" : "blue";

              // تمكين/تعطيل الحقل مع السماح بإدخال متعدد الأرقام
              waterInput.disabled = isWaterOn;
              waterInput.removeAttribute('maxlength'); // إزالة أي قيود على طول الإدخال
          }


          // تحديث كمية المياه عند تغيير القيمة
        waterInput.addEventListener('input', () => {
            const waterValue = parseFloat(waterInput.value);
            if (!isNaN(waterValue) && waterValue >= 0) {
                waterLevel.innerHTML = `${waterValue.toFixed(1)}<span style="margin-left: 3px;">L</span>`;
                if (isWaterOn) { // تحديث Firebase فقط عند التشغيل
                    db.ref("system/totalInput").set(waterValue);
                }
            }
        });

          // تغيير الوضع (تلقائي / يدوي)
          autoIcon.addEventListener("click", () => {
              isAuto = !isAuto;
              updateUI();
              db.ref("system/mode").set(isAuto ? "Auto" : "Manual");
          });

          
        // زر التشغيل / الإيقاف
powerBtn.addEventListener("click", () => {
    if (isWaterOn) {
        // حالة الإيقاف (زر أحمر)
        isWaterOn = false;
        waterInput.value = "";
        waterLevel.innerHTML = `0.0<span style="margin-left: 3px;">L</span>`;
        updateUI();
        
        db.ref("system").update({
            isWaterOn: false,
            totalInput: 0
        });
        
    } else {
        // حالة التشغيل (زر أخضر)
        const waterValue = parseFloat(waterInput.value);
        if (isNaN(waterValue) || waterValue < 100) {
            alert("يجب إدخال 100 لتر على الأقل");
            return;
        }
        
        isWaterOn = true;
        updateUI();
        db.ref("system").update({
            isWaterOn: true,
            totalInput: waterValue
        });
    }
});



          // مراقبة حالة التسرب والمناطق
         db.ref("system/zones").on("value", (snapshot) => {
    const zones = snapshot.val();
    console.log("Zones updated:", zones); // للتتبع
    
    if (!zones) return;
    
    Object.keys(zones).forEach((zoneId, index) => {
        const zone = zones[zoneId];
        const zoneElement = document.querySelector(`.zone:nth-child(${index + 1})`);
        
        if (!zoneElement) return;
        
        // إعادة تعيين الكلاس والأيقونة
        zoneElement.className = "zone";
        zoneElement.innerHTML = zone.hasLeak 
            ? `🚨 <br> ${zone.name}` 
            : `✅ <br> ${zone.name}`;
        
        // إضافة كلاس التسرب إذا لزم الأمر
        if (zone.hasLeak) {
            zoneElement.classList.add("leak");
        }
    });
});

          // مراقبة حالة النظام
          db.ref("system").on("value", (snapshot) => {
              const systemData = snapshot.val();
              if (systemData) {
                  isWaterOn = systemData.isWaterOn !== undefined ? systemData.isWaterOn : true;
                  isAuto = systemData.mode === "Auto";
                  
                  updateUI();
                  
                  if (systemData.totalInput !== undefined) {
                      waterLevel.innerHTML = `${systemData.totalInput.toFixed(1)}<span style="margin-left: 3px;">L</span>`;
                    waterInput.value = systemData.totalInput > 0 ? systemData.totalInput : '';
                  }
              }
          });

          // تهيئة النظام عند التشغيل لأول مرة
          db.ref("system").set({
            isWaterOn: false,
            mode: "Manual",
            totalInput: 0,
            zones: {
              "1": { 
                name: "المنطقة 1", 
                hasLeak: false, 
                waterConsumed: 0 
              },
              "2": { 
                name: "المنطقة 2", 
                hasLeak: false, 
                waterConsumed: 0 
              },
              "3": { 
                name: "المنطقة 3", 
                hasLeak: false, 
                waterConsumed: 0 
              },
              "4": { 
                name: "المنطقة 4", 
                hasLeak: false, 
                waterConsumed: 0 
              }
            }
          });


          // تهيئة واجهة المستخدم عند البدء
          updateUI();
      });




      // استبدال كود التهيئة بهذا:
function initializeSystem() {
    db.ref("system").once("value").then((snapshot) => {
        if (!snapshot.exists()) {
            db.ref("system").set({
                isWaterOn: false,
                mode: "Manual",
                totalInput: 0,
                zones: {
                    "1": { name: "المنطقة 1", hasLeak: false, waterConsumed: 0 },
                    "2": { name: "المنطقة 2", hasLeak: false, waterConsumed: 0 },
                    "3": { name: "المنطقة 3", hasLeak: false, waterConsumed: 0 },
                    "4": { name: "المنطقة 4", hasLeak: false, waterConsumed: 0 }
                }
            });
        }
    });
}

// استدعاء الدالة عند التحميل
initializeSystem();