// const arr1 = [10, 20, 30, 40];
// const arr2 = [20, 40, 50, 60];
// let two = [...arr1, ...arr2];

const { object } = require("joi");

// let a = {};

// for (let i = 0; i < two.length; i++) {
//   if (a[two[i]]) {
//     a[two[i]]++;
//   } else {
//     a[two[i]] = 1;
//   }
// }

// for (let key in a) {
//   if (a[key] === 2) {
//     console.log(key);
//   }
// }

// let a = {};
// for (let i = 0; i < arr.length; i++) {
//   if (a[arr[i]]) {
//     a[arr[i]]++;
//   } else {
//     a[arr[i]] = 1;
//   }
// }

// for (let key in a) {
//   if (a[key] ===1) {
//     console.log(key);
//     break;
//   }
// }

// const arr1 = [10, 20, 30];
// const arr2 = [10, 30, 30];
// let equal = true;
// if (arr1.length !== arr2.length) {
//   equal = false;
// }

// else {
//   for (let i = 0; i < arr1.length; i++) {
//     if (arr1[i] !== arr2[i]) {
//       equal = false;
//       break;
//     }
//   }
// }
// console.log(equal);

// const arr = [10, 20, 30, 40, 50];
// const first = arr[0];

// for (let i = 0; i < arr.length; i++) {
//   arr[i] = arr[i + 1];
// }
// arr[arr.length-1] = first;
// console.log(arr);

// let arr = [10, 48, 29, 50, 50];
// let larger = arr[0];
// let second = 0;
// for (let i = 1; i < arr.length; i++) {
//   if (arr[i] > larger) {
//     second = larger;
//     larger = arr[i];

//   }
// }
//   console.log(second);

// const arr = [10, 20, 30, 40, 50];

// let k = arr[0];
// let m = arr[1];

// for (let i = 0; i < arr.length; i++) {
//   arr[i] = arr[i + 2];
// }
// arr[arr.length - 2] = k;
// arr[arr.length - 1] = m;
// console.log(arr);

// const arr =  Array.from(["kapil","k"]);
// // console.log(arr);
// const arr = [10, 20, 30, ,30];

// console.log(arr);
// [10, 20, 30]
// const arr = [0, 1, 2, 3, 5, 6, 7, 8, 11];
// let mn = 0;
// let mx = arr.length - 1;
// let t = 11;
// let result = "";
// while (mn < mx) {
//   m = arr[mn] + arr[mx];
//   if (m == t) {
//     result = arr[mn] + ", " + arr[mx];
//     break;
//   } else if (m < t) {
//     mn++;
//   } else {
//     mx--;
//   }
// }
// console.log(result);

// const arr = [0, 1, 3, 5, 6,  8];
// let sum = 10;
// let l = arr.length - 1;
// let result = null;
// let a = 0;
// let i = 0;
// while (i <= l) {
//   result = arr[i] + arr[a];

//   if (result === sum && i !== a) {
//     console.log(arr[i]);
//     console.log(arr[a]);
//     break;
//   }
//   if (i === l) {
//     i = 0;
//     a++;
//   } else {
//     i++;
//   }
// }
// function user(name,age){
//   this.name=name
//   this.age=age;
// }

// const usea = new user("kapil",3);
// usea.name = "kapl";
// console.log(usea);

// const userMethods = {
//   greet() {
//     console.log(`Hello ${this.name}`);
//   },
// };
// const user = Object.create(userMethods);
// user.name = "kapil";
// console.log(user);
// user.greet();

// class User {
//   constructor(name, age) {
//     this.name = name;
//     this.age = age;
//   }
// }
// const user = new User("kapil", 34);
// console.log(user);

// const user = {
//   name: "Kapil",
//   age: 22,
//   city: "Gurgaon",
// };
// console.log(Object.entries(user));

const arr = ["kapil", "rohit", "sachin", "rohit"];

// const a = arr.includes("kapil");
// console.log(a);

// const a = arr.indexOf("kapil");
// console.log(a);

// const a = arr.includes("amit")
//   ? console.log("include")
//   : console.log("not include");

for (let i = 0; i < arr.length; i++) {
  if (arr[i] === "rohit") {
    arr[i] = "amit";
  }
}
console.log(arr);
