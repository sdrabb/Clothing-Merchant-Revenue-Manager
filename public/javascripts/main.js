
angular.module('invoicing', ['ui.filters', 'ui.bootstrap','ui.bootstrap.tpls'])

// The default logo for the invoice
.constant('DEFAULT_LOGO', 'images/metaware_logo.png')

// The invoice displayed when the user first uses the app
.constant('DEFAULT_INVOICE', {
  tax: 22.00,
  invoice_number: 10,
  rit_acc: false,
  enasarco: false,
  customer_info: {
    name: '',
    web_link: '',
    address1: '',
    address2: '',
    postal: ''
  },
  company_placeholders:{
      name: "Destinatario",
      shop_name: "Nome Negozio",
      address: "Indirzzo",
      pi:"Partita Iva",
      fiscal_code: "Codice Fiscale",
      zip_code:"CAP Citta'"
  },
  company_info:{
    name: "",
    shop_name: "",
    address: "",
    pi:"",
    fiscal_code: "",
    zip_code:""
  }
  ,
  items:[
    { qty: 10, description: 'Gadget', cost: 9.95 }
  ]
})

// Service for accessing local storage
.service('LocalStorage', [function() {

  var Service = {};

  // Returns true if there is a logo stored
  var hasLogo = function() {
    return !!localStorage['logo'];
  };

  // Returns a stored logo (false if none is stored)
  Service.getLogo = function() {
    if (hasLogo()) {
      return localStorage['logo'];
    } else {
      return false;
    }
  };

  Service.setLogo = function(logo) {
    localStorage['logo'] = logo;
  };

  // Checks to see if an invoice is stored
  var hasInvoice = function() {
    return !(localStorage['invoice'] == '' || localStorage['invoice'] == null);
  };

  // Returns a stored invoice (false if none is stored)
  Service.getInvoice = function() {
    if (hasInvoice()) {
      return JSON.parse(localStorage['invoice']);
    } else {
      return false;
    }
  };

  Service.setInvoice = function(invoice) {
    localStorage['invoice'] = JSON.stringify(invoice);
  };

  // Clears a stored logo
  Service.clearLogo = function() {
    localStorage['logo'] = '';
  };

  // Clears a stored invoice
  Service.clearinvoice = function() {
    localStorage['invoice'] = '';
  };

  // Clears all local storage
  Service.clear = function() {
    localStorage['invoice'] = '';
    Service.clearLogo();
  };

  return Service;

}])

// Service for accessing local storage
.service('InvoiceManager', ['$http',function($http) {

  var Service = {};

  Service.sendInvoice = function(invoice) {
    return $http({
            url: '/postInvoice',
            method: "POST",
            data: { 'invoice' : invoice }
          })
  };

  Service.updateInvoice = function(invoice){
    return $http({
            url: '/updateInvoice',
            method: "POST",
            data: { 'invoice' : invoice }
          })
  };

  Service.saveCustomer = function(customer) {
    return $http({
            url: '/saveCustomer',
            method: "POST",
            data: { 'customer' : customer }
          })
  };

  Service.saveCompany = function(company) {
    return $http({
            url: '/saveCompany',
            method: "POST",
            data: { 'company' : company }
          })
  };

  Service.getCustomers = function() {
    return $http({
            url: '/getCustomers',
            method: "GET",
          })
  };

  Service.getCompanies = function() {
    return $http({
            url: '/getCompanies',
            method: "GET",
          })
  };

  Service.getInvoices = function() {
    return $http({
            url: '/getInvoices',
            method: "GET",
          })
  };
  
  Service.removeInvoice = function(invoice) {
    return $http({
            url: '/removeInvoice',
            method: "POST",
            data: { 'invoice' : invoice }
          })
  };

  

  return Service;

}])

.service('Currency', [function(){

  var service = {};

  service.all = function() {
    return [
      {
        name: 'British Pound (£)',
        symbol: '£'
      },
      {
        name: 'Canadian Dollar ($)',
        symbol: 'CAD $ '
      },
      {
        name: 'Euro (€)',
        symbol: '€'
      },
      {
        name: 'Indian Rupee (₹)',
        symbol: '₹'
      },
      {
        name: 'Norwegian krone (kr)',
        symbol: 'kr '
      },
      {
        name: 'US Dollar ($)',
        symbol: '$'
      }
    ]
  }

  return service;
  
}])

// Main application controller
.controller('InvoiceCtrl', ['$scope', '$http', '$uibModal','$log', 'DEFAULT_INVOICE', 'DEFAULT_LOGO', 'LocalStorage', 'Currency', 'InvoiceManager',
  function($scope, $http, $uibModal, $log, DEFAULT_INVOICE, DEFAULT_LOGO, LocalStorage, Currency, InvoiceManager) {

    $scope.openNewDestinatarioDialog = function () {

      $uibModal.open({
            templateUrl: 'views/NewCompanyModal.ejs',
            resolve: {
                email: function () {
                    return $scope.email;
                }
            },
            controller: newCompanyCtrl
        }).result.then(function (p) {
          $scope.getCompanies();
        });
    };

    $scope.openInvoicesTableDialog = function () {

      $uibModal.open({
            size: 'lg',
            templateUrl: 'views/InvoicesTableModal.ejs',
            resolve: {
                email: function () {
                    return $scope.email;
                }
            },
            controller: invoiceTableCtrl
        }).result.then(function (p) {
            $scope.getInvoices();
        });
    };


    $scope.openNewIntestatarioDialog = function () {

      $uibModal.open({
            templateUrl: 'views/NewCustomerModal.ejs',
            resolve: {
                email: function () {
                    return $scope.email;
                }
            },
            controller: newCustomerCtrl
        }).result.then(function (p) {
            $scope.getCustomers();
        });
    };


  
  // Set defaults
  $scope.currencySymbol = '€';
  $scope.logoRemoved = false;
  $scope.printMode   = false;

  (function init() {
    // Attempt to load invoice from local storage
    !function() {
      var invoice = LocalStorage.getInvoice();
      $scope.invoice = invoice ? invoice : DEFAULT_INVOICE;
    }();

    // Set logo to the one from local storage or use default
    !function() {
      var logo = LocalStorage.getLogo();
      $scope.logo = logo ? logo : DEFAULT_LOGO;
    }();

    $scope.availableCurrencies = Currency.all();

  })()
  // Adds an item to the invoice's items
  $scope.addItem = function() {
    $scope.invoice.items.push({ qty:0, cost:0, description:"" });
  }

  // Toggle's the logo
  $scope.toggleLogo = function(element) {
    $scope.logoRemoved = !$scope.logoRemoved;
    LocalStorage.clearLogo();
  };

  // Triggers the logo chooser click event
  $scope.editLogo = function() {
    // angular.element('#imgInp').trigger('click');
    document.getElementById('imgInp').click();
  };

  $scope.printInfo = function() {
    window.print();
  };

  // Remotes an item from the invoice
  $scope.removeItem = function(item) {
    $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
  };

  // Calculates the sub total of the invoice
  $scope.invoiceSubTotal = function() {
    var total = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      total += (item.qty * item.cost);
    });
    return total;
  };

  // Calculates the tax of the invoice
  $scope.calculateTax = function() {
    return (($scope.invoice.tax * $scope.invoiceSubTotal())/100);
  };

  // Calculates enasarco 23% over 50% imponibile
  $scope.calculateEnasarco = function() {
    return (($scope.invoiceSubTotal()/100)*8);
  };

  // Calculates enasarco 23% over 50% imponibile
  $scope.calculateRitenutaAcconto = function() {
    return (((($scope.invoiceSubTotal()/100)*50)/100)*23);
  };

  // Calculates the grand total of the invoice
  $scope.calculateGrandTotal = function() {

    let enasarco = $scope.invoice.enasarco == true ? $scope.calculateEnasarco() : 0.0 ;
    let rit_acc = $scope.invoice.rit_acc == true ? $scope.calculateRitenutaAcconto() : 0.0 ;
    $scope.invoice.grandTotal = (($scope.calculateTax() + $scope.invoiceSubTotal()) - (enasarco + rit_acc));
    saveInvoice();
    return $scope.invoice.grandTotal;
  };

  // Clears the local storage
  $scope.clearLocalStorage = function() {
    var confirmClear = confirm('Are you sure you would like to clear the invoice?');
    if(confirmClear) {
      LocalStorage.clear();
      setInvoice(DEFAULT_INVOICE);
    }
  };

  // Sets the current invoice to the given one
  var setInvoice = function(invoice) {
    $scope.invoice = invoice;
    saveInvoice();
  };

  // Sets the current invoice to the given one
  $scope.getInvoices = function() {
    InvoiceManager.getInvoices()
      .then((res) => {
        $scope.invoices = Object.values(res.data.invoices);
        $scope.invoice.invoice_number  = Object.keys(res.data.invoices).length + 1;
        return $scope.invoices;
      })
  };

   // Sets the current invoice to the given one
   $scope.getCompanies = function() {
    InvoiceManager.getCompanies()
      .then((res) => {
        $scope.companies = Object.values(res.data.companies);
        return $scope.companies;
      })
  };

    // Sets the current invoice to the given one
    $scope.getCustomers = function() {
    InvoiceManager.getCustomers()
      .then((res) => {
        $scope.customers = Object.values(res.data.customers);
        return $scope.customers;
      })
  };

  // Sets the current invoice to the given one
  $scope.postInvoice = function(invoice) {
    InvoiceManager.sendInvoice($scope.invoice)
    .then(function(response) {
      $scope.getInvoices();
    }, 
    function(response) { // optional
            // failed
    });
  };

   // Sets the current invoice to the given one
   $scope.getDate = function(invoice) {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    $scope.invoice.date = day + '/' + month + '/' + year;
  };

  // Sets the current invoice to the given one
  $scope.removeInvoice = function(invoice) {
    InvoiceManager.removeInvoice($scope.invoice)
    .then(function(response) {
      $scope.getInvoices();
    }, 
    function(response) { // optional
            // failed
    });
  };

  // Reads a url
  var readUrl = function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('company_logo').setAttribute('src', e.target.result);
        LocalStorage.setLogo(e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  };


  // Saves the invoice in local storage
  var saveInvoice = function() {
    LocalStorage.setInvoice($scope.invoice);
  };

  // Runs on document.ready
  angular.element(document).ready(function () {
    // Set focus
    document.getElementById('invoice-number').focus();

    // Changes the logo whenever the input changes
    document.getElementById('imgInp').onchange = function() {
      readUrl(this);
    };

    $scope.getInvoices();
    $scope.getCompanies();
    $scope.getCustomers();
    $scope.getDate();
  });

}])

/**
 * This module is from this link: https://raw.githubusercontent.com/angular-ui/angular-ui-OLDREPO/master/modules/filters/unique/unique.js
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('ui.filters', []).filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});


var newCompanyCtrl = function (InvoiceManager, $scope, $uibModalInstance, email) {
  $scope.company = null;


  $scope.ok = function () {

    InvoiceManager.saveCompany($scope.company)
    .then(function(response) {
      
    }, 
    function(response) { // optional
            // failed
    });
      $uibModalInstance.close({});
  };

  $scope.cancel = function (){
    $uibModalInstance.close({});
  };
}

var newCustomerCtrl = function (InvoiceManager, $scope, $uibModalInstance, email) {
  $scope.customer = null;

  $scope.ok = function () {

    InvoiceManager.saveCustomer($scope.customer)
    .then(function(response) {

    }, 
    function(response) { // optional
            // failed
    });
      $uibModalInstance.close({});
  };

  $scope.cancel = function (){
    $uibModalInstance.close({});
  };


}

var invoiceTableCtrl = function (InvoiceManager, $scope, $uibModalInstance,$uibModal) {
  $scope.customer = null;
  $scope.isCollapsed = true;

  function getInvoices(){
    InvoiceManager.getInvoices()
    .then((res) => {
      $scope.invoices = Object.values(res.data.invoices);
      console.log('test')
      return $scope.invoices;
    });
  }

  getInvoices();
 
  $scope.computeTotal = function () {
    let total = 0.0;
    for (let i = 0; i < $scope.filtered_invoices.length; i++) {
      total += $scope.filtered_invoices[i].grandTotal;
    }
    return total;
  };

  $scope.ok = function () {
    $uibModalInstance.close({});
  };

  $scope.currencySymbol = '€';

  $scope.cancel = function (){
    $uibModalInstance.close({});
  };

  $scope.removeInvoice = function(invoice){
    InvoiceManager.removeInvoice(invoice)
    .then(function(response) {
      getInvoices();
    }, 
    function(response) { // optional
            // failed
    });
  }


  $scope.modifyInvoice = function (invoice) {
    $uibModal.open({
          size: 'lg',
          templateUrl: 'views/ModifyInvoiceModal.ejs',
          resolve: {
              invoice: function () {
                  return invoice;
              }
          },
          controller: modifyInvoiceCtrl
      }).result.then(function (p) {
         getInvoices();
      });
  };


}

var modifyInvoiceCtrl = function (InvoiceManager, $scope, $uibModalInstance, invoice) {
  $scope.invoice = invoice;
  $scope.currencySymbol = '€';
  $scope.logoRemoved = true;
  $scope.printMode = false;

  $scope.ok = function () {
    InvoiceManager.updateInvoice($scope.invoice)
    .then(function(response) {
    }, 
    function(response) { // optional
            // failed
    });
      $uibModalInstance.close({});
  };

  $scope.cancel = function (){
    $uibModalInstance.close({});
  };

    // Adds an item to the invoice's items
    $scope.addItem = function() {
      $scope.invoice.items.push({ qty:0, cost:0, description:"" });
    }
  
    // Toggle's the logo
    $scope.toggleLogo = function(element) {
      $scope.logoRemoved = !$scope.logoRemoved;
      LocalStorage.clearLogo();
    };
  
    // Triggers the logo chooser click event
    $scope.editLogo = function() {
      // angular.element('#imgInp').trigger('click');
      document.getElementById('imgInp').click();
    };
  
    $scope.printInfo = function() {
      window.print();
    };
  
    // Remotes an item from the invoice
    $scope.removeItem = function(item) {
      $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
    };
  
    // Calculates the sub total of the invoice
    $scope.invoiceSubTotal = function() {
      var total = 0.00;
      angular.forEach($scope.invoice.items, function(item, key){
        total += (item.qty * item.cost);
      });
      return total;
    };
  
    // Calculates the tax of the invoice
    $scope.calculateTax = function() {
      return (($scope.invoice.tax * $scope.invoiceSubTotal())/100);
    };
  
    // Calculates enasarco 23% over 50% imponibile
    $scope.calculateEnasarco = function() {
      return (($scope.invoiceSubTotal()/100)*8);
    };
  
    // Calculates enasarco 23% over 50% imponibile
    $scope.calculateRitenutaAcconto = function() {
      return (((($scope.invoiceSubTotal()/100)*50)/100)*23);
    };
  
    // Calculates the grand total of the invoice
    $scope.calculateGrandTotal = function() {
  
      let enasarco = $scope.invoice.enasarco == true ? $scope.calculateEnasarco() : 0.0 ;
      let rit_acc = $scope.invoice.rit_acc == true ? $scope.calculateRitenutaAcconto() : 0.0 ;
      $scope.invoice.grandTotal = (($scope.calculateTax() + $scope.invoiceSubTotal()) - (enasarco + rit_acc));
      return $scope.invoice.grandTotal;
    };

}