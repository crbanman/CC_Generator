function getCCNumber(issuer, callback) {
  var digits = [];
  var numDigits = 0;
  switch (issuer) {
    case "visa":
      numDigits = 13 + 3 * Math.floor(Math.random() * (1 + 1)); // Get's either 13 or 16
      digits[0] = 4;
      break;
    case "mastercard":
      numDigits = 16;
      digits[0] = 5;
      digits[1] = Math.floor(Math.random() * (5 - 1 + 1) + 1); // Digit between 1 and 5
      break;
    case "discover":
      numDigits = 16;
      digits[0] = 6;
      digits[1] = 0;
      digits[2] = 1;
      digits[3] = 1;
      break;
    case "amex":
      numDigits = 15;
      digits[0] = 3;
      if (Math.random() < 0.5) {
        digits[1] = 4;
      } else {
        digits[1] = 7;
      }
      break;
    case "custom":
      return chrome.storage.sync.get(
        {
          autoCompleteNumber: null,
          autoCompleteNumberLength: 15,
        },
        function (items) {
          var autoCompleteNumber = items.autoCompleteNumber;
          var autoCompleteNumberLength = items.autoCompleteNumberLength;
          if (autoCompleteNumber) {
            numDigits = autoCompleteNumberLength;
            getCustomValue(function (number) {
              if (number == "Set numbers in options") {
                // get a random number between 1 and 9
                number = Math.floor(Math.random() * Math.floor(9)) + 1;
              }

              digits = number.toString().split("");
              for (var i = 0; i < digits.length; i++) {
                digits[i] = parseInt(digits[i]);
              }
              if (digits.length >= numDigits) {
                // make sure the number isn't greater then max set length
                // also make sure there's room for the check digit
                digits = digits.slice(0, numDigits - 1);
              }

              var newCC = generateCcNumber(digits, numDigits);
              chrome.storage.sync.set({ loadedCC: newCC });
              callback(newCC);
            });
            return;
          }
          getCustomValue(function (newCC) {
            callback(newCC);
          });
        }
      );
  }

  var newCC = generateCcNumber(digits, numDigits);
  chrome.storage.sync.set({ loadedCC: newCC });
  callback(newCC);
}

function generateCcNumber(digits, numDigits) {
  digits[numDigits - 1] = "p";

  for (var i = numDigits - 2; i >= 0 && digits[i] == null; i--) {
    digits[i] = Math.floor(Math.random() * (9 + 1));
  }

  var sum = 0;
  var count = 1;
  for (i = numDigits - 2; i >= 0; i--) {
    if (count % 2 != 0) {
      var num = digits[i] * 2;
      if (num >= 10) {
        num -= 9;
      }
      sum += num;
    } else {
      sum += digits[i];
    }
    count++;
  }
  digits[numDigits - 1] = (-(sum % 10) + 10) % 10;
  return digits.join("");
}

function getCustomValue(callback) {
  var setNumbersText = "Set numbers in options";
  var newCC = 0;

  chrome.storage.sync.get({ customNumbers: [] }, function (items) {
    customNumbers = items.customNumbers;

    var numCount = customNumbers.length;
    if (numCount <= 0 || (numCount == 1 && customNumbers[0] == "")) {
      newCC = setNumbersText;
      console.log(newCC);
    } else {
      newCC = customNumbers[Math.floor(Math.random() * numCount)];
    }

    chrome.storage.sync.set({ loadedCC: newCC });
    callback(newCC);
  });
}

function addToValueToClipboard(value) {
  var ccNumber = document.createElement("textarea");
  document.body.appendChild(ccNumber);
  ccNumber.value = value;
  ccNumber.focus();
  ccNumber.select();
  document.execCommand("copy");
  ccNumber.remove();
}
