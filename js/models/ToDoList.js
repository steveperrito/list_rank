import Mustache from 'mustache';

/**
 * Model class handles most data manipulation.
 *
 * @param {Array} toDoItems - objects that represent one to-do item.
 * @constructor
 */
export default function ToDoList(toDoItems){
  var That = this;

  this.toDoItems = toDoItems.map(function(el){
    el.UID = That.generateID();
    return el;
  });
}

/**
 * Generates a unique ID, later used for 2-way binding
 * between Dom and Model.
 *
 * @returns {String}
 */
ToDoList.prototype.generateID = function() {
  return 'r' + Math.random().toString(36).substr(2, 9);
};

/**
 * Returns true if data saved to local storage
 *
 * @returns {Boolean}
 */
ToDoList.prototype.save = function(){
  try {
    localStorage.setItem('ToDoList', JSON.stringify(this.toDoItems));
  }
  catch(e){
    return alert('error' + ' ' + e.message);
  }

  return true;
};

/**
 * Adds to-do item.
 *
 * @param itemObject {Object}
 * @returns {ToDoList}
 */
ToDoList.prototype.add = function(itemObject) {
  itemObject.UID = this.generateID();
  this.toDoItems.unshift(itemObject);

  return this;
};


/**
 * Deletes to-do item.
 *
 * @param itemUID {String}
 * @returns {ToDoList}
 */
ToDoList.prototype.remove = function(itemUID) {

  this.toDoItems = this.toDoItems.filter(el => el.UID !== itemUID);

  return this;
};

/**
 * Removes all completed tasks.
 *
 * @returns {ToDoList}
 */
ToDoList.prototype.clearCompleted = function () {

  this.toDoItems = this.toDoItems.filter(el => !el.completed);

  return this;
};

/**
 * Returns true if some item is marked as completed
 *
 * @returns {boolean}
 */
ToDoList.prototype.hasCompletedItems = function () {
  return this.toDoItems.some(el => el.completed );
};

/**
 * Edits to-do item.
 *
 * @param itemUID {String}
 * @param edits {Object}
 * @returns {ToDoList}
 */
ToDoList.prototype.edit = function(itemUID, edits) {
  this.toDoItems = this.toDoItems.map(el => {
    if (el.UID === itemUID) {
      for (var itemProperty in edits) {
        el[itemProperty] = edits[itemProperty];
      }
      return el;
    }
    return el;
  });

  return this;
};

/**
 * Marks to-do item complete.
 *
 * @param itemUID {String}
 * @returns {ToDoList}
 */
ToDoList.prototype.complete = function(itemUID) {
  this.toDoItems = this.toDoItems.map(el => {
    if (el.UID == itemUID) {
      el.completed = true;
      return el;
    }

    return el;
  });

  return this;
};

/**
 * Marks to-do item incomplete.
 *
 * @param itemUID {String}
 * @returns {ToDoList}
 */
ToDoList.prototype.notComplete = function(itemUID) {
  this.toDoItems = this.toDoItems.map(el => {
    if (el.UID == itemUID) {
      delete el.completed;
      return el;
    }

    return el;
  });

  return this;
};

/**
 * Returns HTML (table rows) with items listed
 *
 * @param templateID {String} - id of element (selected
 * with jQuery)
 */
ToDoList.prototype.render = function(templateID){
  var template = $('#' + templateID).html();
  var view = {
    'items' : this.toDoItems,
    'ranking' : function() {
      var stars = '';
      for (var i = 0;i< this.rank;i++) {
        stars += '<span class="glyphicon glyphicon-star gold"></span>';
      }

      return stars;
    }
  };

  return Mustache.render(template, view);
};

/**
 * Renders HTML for to-do item editing.
 *
 * @param templateID
 * @param itemUID
 */
ToDoList.prototype.renderEditable = function(templateID, itemUID) {
  var template = $('#' + templateID).html();
  var entryToEdit = this.toDoItems.filter(el => el.UID == itemUID);
  var view = {
    'items' : entryToEdit
  };

  return Mustache.render(template, view);
};

/**
 * Sorts list by columns (rank or to-do item).
 * order can be ascending ('asc') or descending
 * ('desc')
 *
 * @param attribute {String} - can be 'rank' or 'item'
 * @param order {String} -  can be 'asc' or 'desc'
 * @returns {ToDoList}
 */
ToDoList.prototype.sortBy = function(attribute, order) {
  if (order == 'asc') {
    this.toDoItems.sort(function(a,b){
      if(a[attribute] < b[attribute]) return -1;
      if(a[attribute] > b[attribute]) return 1;
      return 0;
    });
  }

  if (order == 'desc') {
    this.toDoItems.sort(function(a,b){
      if(a[attribute] > b[attribute]) return -1;
      if(a[attribute] < b[attribute]) return 1;
      return 0;
    });
  }

  return this;
};

/**
 * Sorts list by each item's completed status.
 * Completed items go to the bottom.
 *
 * @returns {ToDoList}
 */
ToDoList.prototype.sortByStatus = function() {
  this.toDoItems.sort(function(a,b) {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  return this;
};

/**
 * Sorts list first by completed status, then by column
 * attribute in 'asc' or 'desc' order.
 *
 * @param attribute {String} - 'item' or 'rank'
 * @param order {String} - 'asc' or 'desc'
 * @returns {ToDoList}
 */
ToDoList.prototype.sortIncompleteBy = function(attribute, order) {
  if (order == 'asc') {
    this.toDoItems.sort(function(a,b){
      if ((a.completed && b.completed) || (!a.completed && !b.completed)) {
        if(a[attribute] < b[attribute]) return -1;
        if(a[attribute] > b[attribute]) return 1;
        return 0;
      }
      if (!a.completed && b.completed) {
        return -1;
      }

      return 1;
    });
  }

  if (order == 'desc') {
    this.toDoItems.sort(function(a,b){
      if ((a.completed && b.completed) || (!a.completed && !b.completed)) {
        if (a[attribute] > b[attribute]) return -1;
        if (a[attribute] < b[attribute]) return 1;
        return 0;
      }
      if (!a.completed && b.completed) {
        return -1;
      }

      return 1;
    });
  }

  return this;
};

/**
 *
 * @param UIDs
 * @returns {ToDoList}
 */
ToDoList.prototype.sortByUID = function(UIDs) {
  this.toDoItems = this.toDoItems.map(el => {
    if (el.firstCompletedItem) {
      delete el.firstCompletedItem;
      return el
    }

    return el;
  });

  this.toDoItems.sort(function (a, b) {
    return UIDs.indexOf(a.UID) - UIDs.indexOf(b.UID);
  });

  return this;
};

/**
 * Marks the first completed item so that template renders a title
 * above all completed items.
 *
 * This only works if you are sorting completed items to the
 * bottom of the list.
 *
 * @returns {ToDoList}
 */
ToDoList.prototype.markFirstCompleted = function() {
  this.toDoItems = this.toDoItems.map(el => {
    if (el.firstCompletedItem) {
      delete el.firstCompletedItem;
      return el
    }

    return el;
  });

  for (var i = 0; i<this.toDoItems.length; i++) {
    if (this.toDoItems[i].completed) {
      this.toDoItems[i].firstCompletedItem = true;
      break;
    }
  }

  return this;
};
