let mineArray = null;
let mineArea = getElement(".mineArea");
let tableData = [];
let flagArr = [];
let btns = getElementAll(".level>button")
let flagNum = getElement('.flagNum')
var mineNumber =  getElement('.mineNum')
/**
 * 初始化雷区
 * 该函数用于生成一个包含雷区的数组
 *
 * @returns {Array} 返回一个包含雷区的数组
 */
function initMine() {
  // 根据当前雷区的行和列计算总数，并创建一个数组
  var arr = new Array(curLevel.row * curLevel.col);
  // 为数组的每个位置初始化一个值，该值为索引本身
  for (var i = 0; i < arr.length; i++) {
    arr[i] = i;
  }
  // 将数组随机排序，以用于后续的雷区分配
  arr.sort(() => 0.5 - Math.random());
  // 从随机排序后的数组中取出前curLevel.mineNum个元素作为雷区位置，并返回这个包含雷的数组
  return arr.slice(0, curLevel.mineNum);
}

function clearScene() {
  mineArea.innerHTML = ""
  flagArr = []
  flagNum.innerHTML = 0
  mineNumber.innerHTML = curLevel.mineNum

}

function init() {
  clearScene();
  mineArray = initMine();

  var table = document.createElement("table");

  var index = 0;

  for (var i = 0; i < curLevel.row; i++) {
    var tr = document.createElement("tr");
    tableData[i] = [];
    for (var j = 0; j < curLevel.col; j++) {
      var td = document.createElement("td");
      var div = document.createElement("div");
      tableData[i][j] = {
        row: i,
        col: j /*  */,
        type: "number",
        value: 0,
        index,
        checked: false,
      };

      div.dataset.id = index;
      div.classList.add("canFlag");

      if (mineArray.includes(tableData[i][j].index)) {
        tableData[i][j].type = "mine";
        div.classList.add("mine");
      }
      td.appendChild(div);
      tr.appendChild(td);

      index++;
    }
    table.appendChild(tr);
  }
  mineArea.appendChild(table);

   // 为mineArea元素添加点击事件监听器
   mineArea.onmousedown = function (e) {
    // 获取点击的元素
    var target = e.target;
    // 如果点击的元素是div，并且该div的classList中包含canFlag，则执行以下操作
    if (target.classList.contains("canFlag")) {
      // 如果点击的元素是div，并且该div的classList中包含canFlag，则执行以下操作
      if (e.button === 0) {
        // 如果点击的按钮是左键，则执行以下操作
        searchArea(target);
      }
      if (e.button === 2) {
        flag(target);
      }
    }
  };
}

/**
 * 显示答案函数
 * 遍历当前关卡的所有单元格，将地雷类型的单元格标记出来
 */
function showAnswer() {
  var isAllRight = true;
  var mineArr = getElementAll("td>div.mine");
  for (var i = 0; i < mineArr.length; i++) {
    mineArr[i].style.opacity = 1;
  }

  for (var i = 0; i < flagArr.length; i++) {
    if (flagArr[i].classList.contains("mine")) {
      flagArr[i].classList.add("right");
    } else {
      flagArr[i].classList.add("error");
      isAllRight = false;
    }
  }
  if (!isAllRight || flagArr.length !== curLevel.mineNum) {
    gameOver(false);
  }
  mineArea.onmousedown = null;
}

function getTableItem(target) {
  var index = target.dataset.id;
  var flatTable = tableData.flat();
  return flatTable.filter((item) => item.index == index)[0];
}

function getBound(obj) {
  var rowTop = obj.row - 1 < 0 ? 0 : obj.row - 1;
  var rowBottom = obj.row + 1 >= curLevel.row ? curLevel.row - 1 : obj.row + 1;
  var colLeft = obj.col - 1 < 0 ? 0 : obj.col - 1;
  var colRight = obj.col + 1 >= curLevel.col ? curLevel.col - 1 : obj.col + 1;

  return {
    rowTop,
    rowBottom,
    colLeft,
    colRight,
  };
}

function findMineNum(obj) {
  var { rowTop, rowBottom, colLeft, colRight } = getBound(obj);
  var count = 0;
  for (var i = rowTop; i <= rowBottom; i++) {
    for (var j = colLeft; j <= colRight; j++) {
      var item = tableData[i][j];
      if (item.type === "mine") {
        count++;
      }
    }
  }
  return count;
}

function getDom(obj) {
  return getElement(`[data-id="${obj.index}"]`);
}

/**
 * 搜索九宫格区域
 * @param {*} target
 */
function getArround(target) {
  if (!target.classList.contains("flag")) {
    target.parentNode.style.border = "none";
    target.classList.remove("canFlag");
    var tableItem = getTableItem(target);
    console.log(tableItem)
    if (!tableItem) {
      return;
    }

    tableItem.checked = true;

    var mineNum = findMineNum(tableItem);

    if (!mineNum) {
      var { rowTop, rowBottom, colLeft, colRight } = getBound(tableItem);
      for (var i = rowTop; i <= rowBottom; i++) {
        for (var j = colLeft; j <= colRight; j++) {
          if (!tableData[i][j].checked) {
            getArround(getDom(tableData[i][j]));
          }
        }
      }
    } else {
      var cl = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
      ];
      target.classList.add(cl[mineNum]);
      target.innerText = mineNum;
    }
  }
}

/**
 * 搜索区域
 * 此函数用于处理玩家左键点击可标记元素时的游戏逻辑
 * @param {Element} target - 被点击的元素
 */
function searchArea(target) {
  if (target.classList.contains("mine")) {
    target.classList.add("error");
    showAnswer();
    return;
  }
  getArround(target);
}

function isWin() {
  for (var i = 0; i < flagArr.length; i++) {
    if (!flagArr[i].classList.contains("mine")) {
      return false;
    }
  }
  return true;
}

function gameOver(isWin) {
  var mess = "";
  if (isWin) {
    mess = "恭喜你，游戏胜利！";
  } else {
    mess = "游戏失败！";
  }
  console.log(mess)
}
function flag(target) {
  if (target.classList.contains("canFlag")) {
    if (!flagArr.includes(target)) {
      flagArr.push(target);
      target.classList.add("flag");
      if (flagArr.length === curLevel.mineNum) {
        if (isWin()) {
          gameOver(true);
        }
        showAnswer();
      }
    } else {
      var index = flagArr.indexOf(target);
      flagArr.splice(index, 1);
      target.classList.remove("flag");
    }
   flagNum.innerHTML = flagArr.length;
  }
}

/**
 * 绑定环境事件监听器
 * 此函数为游戏区域绑定点击事件监听器，用于处理玩家的点击交互
 * 当玩家点击mineArea中的元素时，会根据点击的元素类别执行不同的操作
 */
function bindEnv() {
 
  // 取消右键菜单
  mineArea.oncontextmenu = function (e) {
    e.preventDefault();
  };

  getElement(".level").onclick = function (e) {
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove("active")
    }
    e.target.classList.add("active")
    switch (e.target.innerHTML) {
      case "初级": {
        curLevel = config.easy;
        break
      }
      case "中级": {
        curLevel = config.normal;
        break
      }
      case "高级": {
        curLevel = config.hard;
        break
      }
    }
    init()
  }
}
/**
 * 程序入口
 * 初始化程序并绑定环境变量
 */
function main() {
  init(); // 初始化程序
  bindEnv(); // 绑定环境变量
}

main();
