// declaration of global vars

var productsContainer,
    productsList,
	shoppingCartContainer,
    shoppingCartTotal,
    cartButton,
    cartButtonQty,
    currentCat,
    clearButton,
    checkoutButton,
	popupContainer,
	popupInterface,
    couponCodeField;

var timer;

// class with constructor for product object

var Product = function(itemName, brand, cat, price, desc, imgPath, maxQtyPerOrder) {
    this.itemName = itemName;
    this.brand = brand;
	this.cat = Shop.getCategory(cat);
    this.price = price.toFixed(2);
    this.desc = desc;
    if (imgPath) {
        this.imgPath = imgPath;
    } else {
        this.imgPath = "img/noPreview.jpg";
    }

	this.maxQtyPerOrder = maxQtyPerOrder;
	this.id = Shop.getCategory(cat).toString() + cat.length.toString();
}

// 'Shop' object containins all shop related data (including product objects) and functions

var Shop = {
    products: { // 'products object contains a list of array for each category. the object structure allows for easy reference through dot notation'
        apparel: new Array(),
        collectables: new Array(),
        artwork: new Array(),
        books: new Array()
    },
    displayProducts: function(list) { // this function is called fore displaying products on the website
        var cat = this.getCategory(currentCat) == undefined? "search results":this.getCategory(currentCat); // this inline 'if' statement says to display a category if one is selected, if not, search results will be shown
        productsContainer.innerHTML = // content is added into the 'productsContainers' divs through JS
            "<h1>" + cat.toUpperCase() + "</h1>" +
            "<span>" + (list.length == 0? "No":list.length) +
            " item" + (list.length == 1? "":"s") +
            " found in " + cat +
            ".</span><br/>";
        for (var k = 0; k < list.length; k++) { // looping throuhg all of the products in the currently selected list
            var p = list[k];
            productsContainer.innerHTML +=
                "<div onclick='PopupInterface.drawProductInfo(&quot;" + p.id + "&quot;)'>" +
                    "<div class='square'>" +
                        "<div id='img' style='background-image: url(" + p.imgPath + ")'></div>" +
                    "</div>" +
                    "<h5><br/>" + p.cat + "<h5/>" +
                    "<h3>" + p.itemName + "</h3>" +
                    "<h4>" + p.brand + "</h4>" +
                    "<h2>$" + p.price + "</h2><br/>" +
                    "<button onclick='preventParentEvent(event); ShoppingCart.add(&quot;" + p.id + "&quot;, true);'>ADD TO CART</button>" +
                "</div>"; // drawing all of the appropriate information for each product object
        }
    },
    getCategory: function(ref) {
        for (var c in this.products) {
            if (ref == this.products[c]) {
                return c;
            }
        }
    },
    getProductById: function(id) { // searches through the products object for a product with the inputted id
        for (var c in this.products) { // for loop for object keys
            for (var p = 0; p < this.products[c].length; p++) {
                if (this.products[c][p].id == id) { // check to see if the inputted id equals the id of the current iteration
                    return this.products[c][p]; // if so, return the product of catagory c and product p
                }
            }
        }
    },
    displayCatList: function() { // this function displays the category list and highlights the one that is currently selected
        productsList.innerHTML = "";
        for (var c in this.products) {
            if (this.products[c] == currentCat) { // if this falls true, the current category button will highlighted
                productsList.innerHTML += "<button class='p-selected' onclick='Shop.changeCat(Shop.products." + c + ")'>" + (c.toString().toUpperCase()) + "</button>"; // the class 'p-selected' added styling to highlight the button
            } else {
                productsList.innerHTML += "<button onclick='Shop.changeCat(Shop.products." + c + ")'>" + (c.toString().toUpperCase()) + "</button>";
            }
        }
    },
    changeCat: function(productCat) { // this changes the the category to the one passed in and then displays the products from that category
        currentCat = productCat;
        this.displayProducts(currentCat);
        this.displayCatList();
    },
    searchProducts: function(searchTerm) { // this function searches through all of the products in terms of the product name and category
        var term = searchTerm.toLowerCase(); // converting the term into lower case makes for easier comparison so cases don't matter
        currentCat = null;
        this.displayCatList();
        var searchResults = new Array(); // a local array to store the results found
        for (var c in this.products) { // first we loop through all of the categoies in the product object. 'this' refers to the products array local to this object
            for (var p = 0; p < this.products[c].length; p++) { // next, we loop through the products in the current c
                var added = false; // initially we don't have any results added, so to keep track of this we set a temp var to false
                var name = this.products[c][p].itemName.toLowerCase(); // we get the name value of the current product
                var cat = this.products[c][p].cat.toLowerCase(); // we get the category of the cureent product
                if (term.length <= name.length) { // our search value will only work if it is less than the name length
                    for (var i = 0; i < name.length - term.length + 1; i++) { // i repsents a starting position for the term caparison
                        if (name.substr(i, term.length) == term) { // so we check if the name at position (i) to position (i + length of term) equals the search term
                            searchResults.push(this.products[c][p]);
                            added = true;
                            break; // if it is, we push this product to our search results and set 'added' to true
                        }
                    }
                }
                if (!added && term.length <= cat.length) { // a ver similar searcg algorithm is used for the category as a fallback if nothing was found from searching item name values
                    for (var i = 0; i < cat.length - term.length + 1; i++) {
                        if (cat.substr(i, term.length) == term) {
                            searchResults.push(this.products[c][p]);
                            break;
                        }
                    }
                }
            }
        }
        this.displayProducts(searchResults); // after the search processing is done, we display the results found
    },
    setCanCheckout: function(canCheckout) { // this function enables of disables the user's ability to access the checkout window by directly modiifying the 'onclick' HTML attribute
        if (canCheckout) {
            checkoutButton.setAttribute("onclick", "PopupInterface.drawCheckout();");
        } else {
            checkoutButton.setAttribute("onclick", "alert('You must login to continue.');");
        }
    }
};


var ShoppingCart = { // this object holds all shopping cart related data and functions
    list: new Array(), // this holds all the products in the shopping cart
    shoppingCartShowTime: 1500, // this is the time in millseconds for the cart dropdown to show after adding items to the cart
	itemToHighlight: null,
    add: function(id, maximize) { // this function adds items to the cart via id of the product
        var added = false;
		var exceededQtyItem = null;
        var product = Shop.getProductById(id); // calling a function from the 'Shop' object to find a product with the specified id
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i][0].id == id) { // checking if a item with the same id already exists in the cart
                this.itemToHighlight = this.list[i];
				if (this.list[i].length < this.list[i][0].maxQtyPerOrder) { // if we have not exceeded to max quantity for this item, we add another one into a second dimensional array
					this.list[i].push(product);
					added = true;
					break;
				} else {
					exceededQtyItem = this.list[i][0];
				}
            }
        }
        if (!added) {
			if (exceededQtyItem) {
				alert( // notifying the user if max quantity has been exceeded for current product
					"Only a maximum quantity of " + exceededQtyItem.maxQtyPerOrder + " is allowed for the following item:\n" +
					exceededQtyItem.itemName
				);
			} else {
                this.list.push([product]);
                this.itemToHighlight = this.list[this.list.length - 1];
            }
		}
        this.save(); // the save function updates the storage method currently used - whether it'd be cookies or localStorage
        this.displayList(maximize);
        return;
    },
    clear: function() { // clears the shopping cart
        if (this.getNumOfItems() > 0) {
            if (confirm("Are you sure you want to clear the cart?")) {
                this.list = new Array();
                this.displayList(true);
                this.save();
            }
        }
    },
    displayList: function(maximize) { // displays the shopping cart by drawing new HTML elements
        if (this.getNumOfItems() == 0) {
            shoppingCartTotal.innerHTML = ""; // things to draw if cart is empty
            shoppingCartContainer.innerHTML = "<p style='padding-left: 20px;'>No items in cart.</p>";
        } else {
            shoppingCartTotal.innerHTML = "Total cost:<h2>$" + this.getTotalPrice() + "</h2>";
            shoppingCartTotal.innerHTML += this.getNumOfItems() + " item" + (this.getNumOfItems() == 1? "":"s") + " in cart.";
            shoppingCartContainer.innerHTML = "";
            for (var i = 0; i < this.list.length; i++) {
                var hl = this.itemToHighlight == this.list[i]? ' class="highlight" id="highlight"':"";
                shoppingCartContainer.innerHTML +=
                    "<div onclick='PopupInterface.drawProductInfo(&quot;" + this.list[i][0].id + "&quot;);'" + hl + ">" +
                    "<div class='mini-button' onclick='preventParentEvent(event); ShoppingCart.incrementQty(" + i + ", false, true)'> - </div>" +
                    "<div class='mini-button' onclick='preventParentEvent(event); ShoppingCart.incrementQty(" + i + ", true, true)'> + </div>" +
                    "&nbsp;<strong>" + this.list[i].length + "x</strong>&nbsp;&nbsp;" +
                    this.list[i][0].itemName +
                    "<span>$" + (this.list[i][0].price * this.list[i].length).toFixed(2) +
                    "</span></div>";
            }
        }
        if (!this.list.length) {
            checkoutButton.style.display = "none";
            clearButton.style.display = "none";
        } else {
            checkoutButton.style.display = "block";
            clearButton.style.display = "block";
        }
        if (this.itemToHighlight != null) {
            var hlElement = document.getElementById("highlight");
            if (hlElement) {
                if (hlElement.offsetTop > shoppingCartContainer.scrollTop) {
                    if (hlElement.offsetTop + hlElement.clientHeight > shoppingCartContainer.clientHeight + shoppingCartContainer.scrollTop) {
                        shoppingCartContainer.scrollTop = hlElement.offsetTop;
                    }
                } else {
                    shoppingCartContainer.scrollTop = hlElement.offsetTop - hlElement.clientHeight;
                }
            }
        }
		if (maximize) {
			if (!cartButton.hasClass("hover")) {
				cartButton.addClass("hover");
			} else {
				window.clearTimeout(timer);
			}
			timer = window.setTimeout(function() {
				cartButton.removeClass("hover");
			}, this.shoppingCartShowTime);
		}
        cartButtonQty.innerHTML = "(" + this.getNumOfItems() + ")";
    },
    incrementQty: function(i, increment, maximize) {
        this.itemToHighlight = this.list[i];
        if (!increment) {
            if (this.list[i].length > 1) {
                this.list[i].pop();
            } else {
				if (confirm("Do you want to remove " + this.list[i][0].itemName + " from the cart?")) {
                	this.list.splice(i, 1);
				} else {
					this.displayList(maximize);
					return;
				}
            }
            this.save();
        } else {
            this.add(this.list[i][0].id);
        }
        this.displayList(maximize);
    },
    getNumOfItems: function() {
        var num = 0;
        for (var i = 0; i < this.list.length; i++) {
            num += this.list[i].length;
        }
        return num;
    },
    getTotalPrice: function() {
        var totalPrice = 0;
        for (var i = 0; i < this.list.length; i++) {
            totalPrice += this.list[i][0].price * this.list[i].length;
        }
        return totalPrice.toFixed(2);
    },
    save: function() { // save function saves a stringified piece of code to the storage object
        var tempCart = new Array();
        for (var i = 0; i < this.list.length; i++) {
            tempCart.push([this.list[i][0].id, this.list[i].length]);
		}
        Storage.setItem("shoppingCart", JSON.stringify(tempCart));
    },
    load: function() { // load function gets an item from the storage object by key and is then parsed
        var tempCart = JSON.parse(Storage.getItem("shoppingCart"));
		if (tempCart) {
    		for (var t = 0; t < tempCart.length; t++) {
    			for (var i = 0; i < tempCart[t][1]; i++) { // tempCart[t][1] holds the quantity of current item to add
    				this.add(tempCart[t][0], false); // the 'false' parameters means not to show the dropdown cart when these items are added on load
    			}
    		}
        }
    }
};

var PopupInterface = { // this oject handles the popup interface and rewrites inner HTML
	open: false, // this book keeps track of whether the interface is open or closed
	drawCheckout: function() {
        var randCoupon = CouponManager.getRandomCoupon(); // everytime the checkout is displayed, a random coupon code is also displayed
        var randCouponDiscount = (randCoupon.discount * 100).toString() + "%";
		var checkoutCartItems = "";
		for (var i = 0; i < ShoppingCart.list.length; i++) {
			var p = ShoppingCart.list[i][0];
			checkoutCartItems +=
				"<div>" +
				"&nbsp;<strong>" + ShoppingCart.list[i].length + "x</strong>&nbsp;&nbsp;" +
				p.itemName +
				"<span>$" + (p.price * ShoppingCart.list[i].length).toFixed(2) +
				"</span></div>";
		}
		popupInterface.innerHTML =
			"<aside>" +
				"<h1>Checkout</h1>" +
				"<div class='shopping-cart-container'>" +
					checkoutCartItems +
				"</div><br/>" +
				"<div class='shopping-cart-total'>" +
					"Total cost:<h2 id='total-checkout-cost'>$" + ShoppingCart.getTotalPrice() + "</h2>" +
					ShoppingCart.getNumOfItems() + " item" + (ShoppingCart.getNumOfItems() == 1? "":"s") + " in cart." +
				"</div><br/><hr/><br/>" +
				"<h1>Discount offer</h1>" +
				"<span>Enter code: [<strong>" + randCoupon.code + "</strong>] to get a " + randCouponDiscount + " discount on this purchase.</span><br/><br/>" +
				"Coupon code&nbsp;&nbsp;&nbsp;<input id='coupon-code-field' type='text'/>" +
			"</aside>" +
			"<aside>" +
				"<h1>Payment</h1>" +
                "<form name='checkoutForm' id='checkout-form'>" +
					"<br/><table width='100%'>" +
						"<tr>" +
							"<td align='right'>Name on card</td>" +
							"<td align='left'><input name='nameOnCard' placeholder='John Smith' type='text'/></td>" +
						"</tr>" +
						"<tr>" +
							"<td align='right'>Card number</td>" +
							"<td align='left'><input name='cardNumber' placeholder='1234123412341234' type='number'/></td>" +
						"</tr>" +
						"<tr>" +
							"<td align='right'>Expiry date</td>" +
							"<td align='left'><input name='expiryDate' type='date'/></td>" +
						"</tr>" +
						"<tr>" +
							"<td align='right'>CVV</td>" +
							"<td align='left'><input name='cvv' placeholder='123' type='number'/></td>" +
						"</tr>" +
					"</table><br/>" +
					
                    /*"<br/>Name on card&nbsp;&nbsp;&nbsp;<input name='nameOnCard' type='text'/><br/>" +
                    "Card number&nbsp;&nbsp;&nbsp;<input name='cardNumber' type='number'/><br/>" +
                    "Expiry date&nbsp;&nbsp;&nbsp;<input name='expiryDate' type='date'/><br/>" +
                    "CVV&nbsp;&nbsp;&nbsp;<input name='cvv' type='number'/><br/><br/>" +*/
                "</form>" +
                "<span id='checkout-error-text'></span>" +
                "<button onclick='submitCheckoutForm()'>CONFIRM</button>" +
			"</aside>"; // HTML for popup interface containing the checkout related elements
        initCheckout();
        var total = ShoppingCart.getTotalPrice();
        var discountedTotal;
        document.getElementById("coupon-code-field").oninput = function() {
            CouponManager.hasCoupon(this.value, function(coupon) {
                discountedTotal = (total - (total * coupon.discount)).toFixed(2);
                document.getElementById("total-checkout-cost").innerHTML =
                    "$" + total + " <span style='color: red;'>- " + (coupon.discount * 100).toString() + "%</span> = <span style='color: blue;'>$" + discountedTotal + "</span>";
            });
        };
		this.show(true);
	},
	drawProductInfo: function(id) {
        var p = Shop.getProductById(id);
        popupInterface.innerHTML =
            "<div id='img' style='background-image: url(" + p.imgPath + ")'></div>" +
            "<aside>" +
                "<h1>" + p.itemName + "</h1>" +
                "<h4>by " + p.brand + "</h4><br/>" +
                "<h1>$" + p.price + "</h1><br/>" +
                "<span>(price includes GST)</span><br/><br/>" +
                "<h3>Product Description</h3>" +
                "<span>" + p.desc + "</span><br/><br/><br/>" +
                "<span>Shipping: FREE standard postage<br/>" +
                "Condition: Brand new<br/>" +
                "Returns: NO returns accepted unless incorrect item received<br/>" +
                "Warranty: 2 year warranty<br/>" +
                "Category: " + p.cat.toUpperCaseFirstChar() + "<br/>" +
				"Maximum quantity allowed per order: " + p.maxQtyPerOrder + "</span><br/><br/><br/>" +
                "<button onclick='ShoppingCart.add(&quot;" + p.id + "&quot;, true);'>ADD TO CART</button>" +
            "</aside>" + //drawing all HTML related to an individual product page for the dropdown interface
            "</div>";
        this.show();
	},
	show: function(aboveAll) {
        if (aboveAll) {
            if (!popupContainer.hasClass("above-all")) {
                popupContainer.addClass("above-all");
            }
        } else {
            if (popupContainer.hasClass("above-all")) {
                popupContainer.removeClass("above-all");
            }
        }
        document.body.style.overflowY = "hidden";
        popupContainer.removeClass("hide");
        popupContainer.addClass("show");
		this.open = true;
	},
	hide: function() {
        document.body.style.overflowY = "scroll";
		popupContainer.addClass("hide");
        popupContainer.removeClass("show");
		this.open = false;
	}
};

var CouponManager = { // this object holds all coupon data and related functions
    coupons: new Array(),
    getRandomCoupon: function() {
        return this.coupons[Math.round(Math.random() * (this.coupons.length - 1))];
    },
    createCoupon: function(couponCode, discountPercentage) {
        this.coupons.push({
            code: couponCode,
            discount: discountPercentage
        });
    },
    hasCoupon: function(couponCode, func) {
        for (var i = 0; i < this.coupons.length; i++) {
            if (couponCode == this.coupons[i].code) {
                if (func) {
                    func(this.coupons[i]);
                }
            }
        }
        return false;
    },
    getDiscount: function(couponCode) {
        for (var i = 0; i < this.coupons.length; i++) {
            if (couponCode == this.coupons[i].code) {
                return this.coupons[i].discount;
            }
        }
        return false;
    }
};

function initShop() { // called on page load to initialize
    getShopElementIds();
	addProducts();
    createCoupons();
    Shop.displayProducts(currentCat);
	Shop.displayCatList();
    Shop.setCanCheckout(false);
    ShoppingCart.load();
    ShoppingCart.displayList();
}

function getShopElementIds() { // gets all of the id references required
    currentCat = Shop.products.apparel;
    productsContainer = document.getElementById("products-container");
    shoppingCartContainer = document.getElementById("shopping-cart-container");
	productsList = document.getElementById("products-list");
    shoppingCartTotal = document.getElementById("shopping-cart-total");
    cartButton = document.getElementById("cart-button");
    cartButtonQty = document.getElementById("cart-button-qty");
    clearButton = document.getElementById("clear-button");
    checkoutButton = document.getElementById("checkout-button");
	popupContainer = document.getElementById("popup-container");
	popupInterface = document.getElementById("popup-interface");
}

function createCoupons() { // create coupons
    CouponManager.createCoupon("TwinjiT3CH18", 0.2);
    CouponManager.createCoupon("MASTERMAN01", 0.75);
    CouponManager.createCoupon("EUROPA_2049", 0.15);
	CouponManager.createCoupon("AZA1498", 0.40);
    CouponManager.createCoupon("MARS_MISSION99", 0.25); // first parameter is the code, and second is the discount
}

function addProducts() { // this function holds all of the product creation functions called
    Shop.products.apparel.push(new Product(
        "Blue Jupiter T-shirt",
        "Twinji Textiles",
        Shop.products.apparel,
        40.00,
        "Be awesome with this sick shirt, awe yeah!",
        "img/apparel/bluejupiter-tshirt.jpg",
		4
    ));

    Shop.products.apparel.push(new Product(
        "Space T-shirt",
        "Twinji Textiles",
        Shop.products.apparel,
        40.00,
        "Be awesome with this sick shirt, awe yeah!",
        "img/apparel/space-tshirt.jpg",
        4
    ));

    Shop.products.apparel.push(new Product(
        "Earth T-shirt",
        "Twinji Textiles",
        Shop.products.apparel,
        39.00,
        "Be awesome with this sick shirt, awe yeah!",
        "img/apparel/earth-tshirt.jpg",
        4
    ));

    Shop.products.apparel.push(new Product(
        "Moon T-shirt",
        "Twinji Textiles",
        Shop.products.apparel,
        40.00,
        "Be awesome with this sick shirt, awe yeah!",
        "img/apparel/moon-tshirt.jpg",
        4
    ));

    Shop.products.apparel.push(new Product(
        "Mars Rover T-shirt",
        "Twinji Textiles",
		Shop.products.apparel,
        35.50,
        "Be awesome with this sick shirt, awe yeah!",
        "img/apparel/marsrover-tshirt.jpg",
		4
    ));

    Shop.products.apparel.push(new Product(
        "Red Space T-shirt",
        "Twinji Textiles",
		Shop.products.apparel,
        40.50,
        "Be awesome with this sick shirt, awe yeah!",
        "img/apparel/redspace-tshirt.jpg",
		4
    ));

	Shop.products.collectables.push(new Product(
        "Astronaut Pop Vinyl",
        "Funko",
		Shop.products.collectables,
        19.00,
        "Cool space dude person, awe yeah!",
        "img/collectables/astronaut-pop.jpg",
		5
    ));

    Shop.products.collectables.push(new Product(
        "Wall-E Pop Keychain",
        "Funko",
		Shop.products.collectables,
        12.00,
        "Who could not get this cute little thing?!",
        "img/collectables/wall-e-pop-keychain.jpg",
		5
    ));

    Shop.products.collectables.push(new Product(
        "Solar System Simulator",
        "Twinji Tech",
		Shop.products.collectables,
        34.95,
        "An awesome way to display the entire solar system right in your house!",
        "img/collectables/solar-system-sim.jpg",
		4
    ));

	Shop.products.collectables.push(new Product(
        "Lego Death Star",
        "Lego",
		Shop.products.collectables,
        650.50,
        "Live all of your favorite Star Wars moments now with this amazing Lego set!",
        "img/collectables/lego-death-star.jpg",
		1
    ));

	Shop.products.collectables.push(new Product(
        "Alien Model",
        "Twinji Tech",
		Shop.products.collectables,
        96.25,
        "Add an alien to your collection, why not?",
        "img/collectables/alien-model.jpg",
		3
    ));

	Shop.products.artwork.push(new Product(
        "Endeavor",
        "Twinji Tech",
		Shop.products.artwork,
        140,
        "A great space scene to add to your wall!",
        "img/artwork/endeavor.jpg",
		2
    ));

	Shop.products.artwork.push(new Product(
        "Oracle",
        "Twinji Tech",
		Shop.products.artwork,
        150,
        "A unique art piece to add to your wall!",
        "img/artwork/oracle.jpg",
		2
    ));

	Shop.products.artwork.push(new Product(
        "Deception",
        "Twinji Tech",
		Shop.products.artwork,
        135,
        "A scary armoured alien face!",
        "img/artwork/deception.jpg",
		2
    ));

	Shop.products.books.push(new Product(
		"A Billion Suns",
		"Vishnu Gunapathi",
		Shop.products.books,
		20.00,
		"Great read",
		null,
		10
	));

	Shop.products.books.push(new Product(
		"The Cool Cosmos",
		"Ben Paul",
		Shop.products.books,
		24.00,
		"Great read",
		null,
		10
	));

    Shop.products.books.push(new Product(
		"A Hostile Place",
		"Equardo Johnson",
		Shop.products.books,
		29.95,
		"Great read",
		null,
		10
	));

    Shop.products.books.push(new Product(
		"100 Millenia",
		"Mike Wilson",
		Shop.products.books,
		16.50,
		"Great read",
		null,
		10
	));
}
