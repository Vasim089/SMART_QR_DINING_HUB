from datetime import date, timedelta
from app.database import SessionLocal
from app import models

BAWARCHI_MENU = {
    "BAWARCHI EXPRESS": [
        ("Vegetable Samosa (2Pcs)", 6.23, "Minced Potatoes and Peas wrapped In Pastry Dough And Deep Fried."),
        ("Samosa Chat", 10.39, "Mashed Samosas topped with Chole Masala, Freshly Cut Veggies And Different Sauces."),
        ("Aloo Tikki (2pcs)", 5.19, "Boiled Potatoes Patty Mixed With Peas And Various Curry Spices."),
        ("Aloo Tikki Chat", 10.39, "Mashed Aloo Tikki Topped With Chole Masala, Freshly Cut Veggies And Garnished With Various Sauces."),
        ("Chicken Samosa", 7.27, "Minced Chicken With Various Spices Wrapped In Thin Pastry Dough And Deep Fried."),
        ("Papad 4 pcs", 8.31, "A Thin, Crispy Bread or Wafer Of India, Made Of Lentil Flour and Flavored With Pepper And Other Spices."),
        ("Mirch Bajji (4pcs)", 8.31, "South Indian Street Fried Snack made with Jalapeno Pepper, Gram Flour And Spices. Served with Mint Sauce."),
        ("Cut Mirch Bajji (12pcs)", 8.31, "South Indian Street Fried Snack made with Jalapeno Pepper, Gram Flour And Spices. Served with Mint Sauce."),
        ("Onion Pakora", 8.31, "Battered Onions Deep Fried, Served With Mint Sauce."),
        ("Sweet Potato Fries", 4.15, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Chicken Nuggets & Fries (8pc Chk Nuggets)", 11.43, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
        ("Veg Spring Roll (2 Pc)", 6.23, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Paneer Pakora (2pcs)", 8.31, "Fresh ingredients dipped in seasoned gram-flour batter and fried until crisp and golden."),
        ("French Fries", 4.15, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
    ],
    "SOUPS": [
        ("Veg Corn Soup", 5.19, "Soup Made With Creamy Corn And Vegetables."),
        ("Chicken Corn Soup", 6.23, "Soup Made With Creamy Corn And Chicken."),
        ("Veg Hot and Sour Soup", 5.19, "Soup Made With Vegetables, Kick Of Spices And Splash And Sour Vinegar."),
        ("Chicken Hot and Sour Soup", 6.23, "Soup Made With Chicken, Kick Of Spice And Splash And Sour Vinegar."),
        ("Veg Manchow Soup", 5.19, "Vegetable Soup Made With Soy Sauce, Chili Sauce And Thickened With Corn Flour, Garnished With Scallions. Served With Crispy Fried Noodles."),
        ("Chicken Manchow Soup", 6.23, "Chicken Soup Made With Soy Sauce And Chili Sauce, Thickened With Corn Flour, Garnished With Scallions. Served With Crispy Fried Noodles."),
    ],
    "INDO-CHINESE SPECIALTIES": [
        ("Gobi Manchurian", 11.43, "Deep Fried Cauliflower, Sauteed With House Special Manchurian Sauce. Garnished With Green Onions."),
        ("Chili Chicken", 13.51, "Deep Fried Boneless Chicken Chunks Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
        ("Veg Fried Rice", 10.39, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies."),
        ("Veg Schezwan Fried Rice", 10.39, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Egg Fried Rice", 12.47, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with eggs."),
        ("Egg Schezwan Fried Rice", 12.47, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with eggs. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Chicken Fried Rice", 13.51, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with chicken."),
        ("Chicken Schezwan Fried Rice", 13.51, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with chicken. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Veg Noodles", 10.39, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies."),
        ("Paneer Fried Rice", 12.47, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with paneer (Indian cottage cheese)."),
        ("Paneer Schezwan Fried Rice", 12.47, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with paneer (Indian cottage cheese). Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Shrimp Fried Rice", 14.55, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with shrimp."),
        ("Shrimp Schezwan Fried Rice", 14.55, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies with shrimp. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Veg Schezwan Noodles", 10.39, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Paneer Noodles", 12.47, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with paneer (Indian cottage cheese)."),
        ("Paneer Schezwan Noodles", 12.47, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with paneer (Indian cottage cheese). Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Egg Noodles", 12.47, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with eggs."),
        ("Egg Schezwan Noodles", 12.47, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with eggs. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Chicken Noodles", 13.51, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with chicken."),
        ("Chicken Schezwan Noodles", 13.51, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with chicken. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Shrimp Noodles", 14.55, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with shrimp."),
        ("Shrimp Schezwan Noodles", 14.55, "Stir fried noodles with finely chopped cabbage, carrots, bell pepper and other veggies with shrimp. Mixed with spicy schezwan (indo-chinese) sauce."),
        ("Gobi Manchurian Gravy", 13.51, "A popular Indo-Chinese preparation tossed in a savory, tangy house-style Manchurian sauce."),
        ("Paneer Manchurian Gravy", 13.51, "A popular Indo-Chinese preparation tossed in a savory, tangy house-style Manchurian sauce."),
        ("Chicken Manchurian Gravy", 14.55, "A popular Indo-Chinese preparation tossed in a savory, tangy house-style Manchurian sauce."),
        ("Chili Chicken Gravy", 14.55, "Tossed with chilies, onions and bell peppers in a bold, spicy Indo-Chinese sauce."),
        ("Shrimp Manchurian Gravy", 15.59, "A popular Indo-Chinese preparation tossed in a savory, tangy house-style Manchurian sauce."),
        ("Veg Manchurian", 11.43, "Deep Fried Vegetable Sauteed With House Special Manchurian Sauce. Garnished With Green Onions."),
        ("Veg Manchurian Gravy", 13.51, "A popular Indo-Chinese preparation tossed in a savory, tangy house-style Manchurian sauce."),
        ("Corn Manchurian Gravy", 13.51, "A popular Indo-Chinese preparation tossed in a savory, tangy house-style Manchurian sauce."),
        ("Veg American Chopsuey", 12.47, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Chicken American Chopsuey", 13.51, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
        ("Fusion Veg Noodles", 12.47, "Wok-tossed noodles with savory seasonings and vegetables; the named protein or ingredient defines this variation."),
        ("Fusion Chicken Noodles", 13.51, "Wok-tossed noodles with savory seasonings and vegetables; the named protein or ingredient defines this variation."),
        ("Garlic Chicken Gravy", 14.55, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
    ],
    "APPETIZERS - VEG": [
        ("Chili Gobi", 12.47, "Deep Fried Cauliflower, Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
        ("Chili Paneer", 12.47, "Deep Fried Paneer (Indian Cottage Cheese), Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
        ("Paneer Manchurian", 11.43, "Deep Fried Paneer (Indian Cottage Cheese), Sauteed With House Special Manchurian Sauce. Garnished With Green Onions."),
        ("Paneer 555", 12.47, "Deep Fried Paneer (Indian Cottage Cheese), Sauteed With House Special Spicy Sauce. Garnished With Cashew Powder, Onions And Lime."),
        ("Gobi 555", 12.47, "Deep Fried Cauliflower, Sauteed With House Special Spicy Sauce. Garnished With Cashew Powder, Onions And Lime."),
        ("Corn Manchurian", 11.43, "Deep Fried Baby Corn Sauteed With House Special Manchurian Sauce. Garnished With Green Onions."),
        ("Chili Corn", 12.47, "Deep Fried Baby Corn, Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
        ("Corn 555", 12.47, "Deep Fried Baby Corn, Sauteed With House Special Spicy Sauce. Garnished With Cashew Powder, Onions And Lime."),
        ("Chili Idli", 9.35, "Deep Fried Idli, Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
    ],
    "APPETIZERS - NON VEG": [
        ("Chicken 65", 11.43, "Deep Fried Boneless Chunks Of Chicken Marinated With Ginger And Garlic. Boneless Chicken Chunks Sauteed With House Special Spicy Sauce. Garnished With Jalapeno, Onions And Lime."),
        ("Chicken Lollipops (4pc)", 13.51, "Chicken Wings Pulled, Marinated And Deep Fried In Special Spices."),
        ("Chicken Manchurian", 13.51, "Deep Fried Boneless Chicken Chunks Sauteed With House Special Manchurian Sauce. Garnished With Green Onions."),
        ("Chicken 555", 13.51, "Boneless Chicken Chunks Deep Fried, Sauteed With House Special Spicy Sauce. Garnished With Cashew Powder, Onions And Lime."),
        ("Chicken 999", 13.51, "Boneless Chicken Chunks Sauteed With House Special Spicy Sauce. Garnished With Onions And Lime."),
        ("Chicken Majestic", 13.51, "Chicken Tenders Marinated With Ginger And Garlic Sauce, Lemon Syrup And Soya Sauce. Garnished With Onions And Lime."),
        ("Garlic Chicken", 13.51, "Deep Fried Boneless Chicken Chunks Sauteed With House Special Spicy Sauce With Pinch Of Garlic."),
        ("Karampodi Chicken", 13.51, "Deep Fried Boneless Chicken Chunks Marinated With Karampodi Masala (Indian Spices)."),
        ("Ginger Chicken", 13.51, "Deep Fried Boneless Chicken Chunks Sauteed With House Special Spicy Sauce With Pinch Of Ginger."),
        ("Curry Leaves Chicken", 13.51, "Chicken Sauteed With House Special Spicy Sauce With Pinch Of Curry Leaves."),
        ("Chicken 65 (Saucy)", 12.47, "A signature spicy appetizer with a crisp exterior, aromatic seasoning and a punchy house-style sauce."),
    ],
    "APPETIZERS - SEAFOOD": [
        ("Apollo Fish", 14.55, "Apollo Fish Is A Famous South Indian Fish Appetizer, Boneless Chunks Of Fish Cooked With Various Spices And Curry Leaves."),
        ("Chili Fish", 14.55, "Deep Fried, Battered Boneless Chunks Of Fish Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
        ("Shrimp Manchurian", 15.59, "Shrimp Sauteed With House Special Manchurian Sauce. Garnished With Green Onions."),
        ("Chili Shrimp", 15.59, "Shrimp Sauteed With Bell Peppers, Onions And Spicy Hot Chilli Sauce."),
    ],
    "TANDOORI (CLAYOVEN)": [
        ("Paneer Tikka Kebab (Veg)", 13.51, "Paneer Cubes (Indian Cottage Cheese Cubes) Marinated In Special Spices And Yogurt, Grilled In Clayoven With Cubed Onions And Bell Pepper. Served With Mint Sauce."),
        ("Chicken Tikka Kebab", 15.59, "Boneless Chicken Breast Grilled In Clayoven And Marinated With Special Tandoori Spices And Yogurt. Served With Mint Sauce."),
        ("Tandoori Chicken (Leg Quarter 2pcs)", 8.31, "Bone-in Chicken (Leg Quarter) Grilled In Clayoven And Marinated With Ginger, Garlic, Special Tandoori Spices And Yogurt. Served With Mint Sauce."),
        ("Lamb Chops", 20.79, "Tender Lamb Chops Grilled In Clayoven, Marinated With Special Indian Spices. Served With Mint Sauce."),
        ("Tandoori Shrimp Ajwain", 15.59, "Shrimp Marinated With Chef's Special Spices And Grilled In Clayoven. Served With Mint Sauce."),
        ("Bawarchi Mix Grill", 25.99, "Combination Of Chicken Tikka Kebab, Malai Tikka Kebab, Lamb Chops, And Tandoori Shrimp Ajwain. Served With Mint Sauce."),
        ("Whole Tandoori Chicken", 25.99, "Bone-in Chicken Grilled In Clayoven And Marinated With Ginger, Garlic, Yogurt And Fresh Grounded Spices. Served With Mint Sauce."),
        ("Chicken Seekh Kebab", 13.51, "Kebab Made With Minced Chicken And Seasoned With Various Spices."),
        ("Half Tandoori Chicken", 15.59, "Bone-in Chicken Grilled In Clayoven And Marinated With Ginger, Garlic, Yogurt And Fresh Grounded Spices. Served With Mint Sauce."),
        ("Malai Tikka Kebab", 15.59, "Boneless Chicken Pieces Marinated With Cheese, Mint And Special Spices. Grilled In Our Clay Oven."),
    ],
    "BAWARCHI BIRYANI": [
        ("Veg Dum/Fry Biryani", 12.47, "A popular Hyderabadi dish containing marinated vegetables flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Paneer Biryani", 12.47, "A popular Hyderabadi dish containing marinated paneer (Indian cottage cheese) flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Egg Biryani", 12.47, "A popular Hyderabadi dish containing boiled eggs flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Chicken Dum Biryani", 13.51, "A popular Hyderabadi dish containing tender marinated chicken flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Vijayawada SPL Chicken Biryani (Boneless)", 15.59, "A popular Hyderabadi dish containing tender marinated fried boneless pieces of chicken flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Goat Dum Biryani", 16.63, "A popular Hyderabadi dish containing tender marinated goat flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Kheema Biryani", 16.63, "A popular Hyderabadi dish containing tender minced goat meat flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Shrimp Biryani", 16.63, "A popular Hyderabadi dish containing marinated shrimp flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Veg Paneer Biryani", 12.47, "A popular Hyderabadi dish containing marinated vegetables and paneer (Indian cottage cheese) flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Chicken Tikka Biryani (Boneless Grill)", 19.75, "A popular Hyderabadi dish containing tender marinated grilled/roasted boneless pieces of chicken flavoured with exotic spices cooked with basmati rice. Served with mirchi ka salan & raita."),
        ("Goat Fry Biryani", 16.63, "Fragrant basmati rice layered with aromatic spices and tender goat, cooked in a richly seasoned biryani style."),
        ("Lamb Fry Biryani", 19.75, "Fragrant basmati rice layered with aromatic spices and tender lamb, cooked in a richly seasoned biryani style."),
    ],
    "ENTRÉES - VEG": [
        ("Dal Tadka", 10.39, "Dal (yellow lentils) sauteed with onions, tomatoes and spices."),
        ("Dal Makhani", 12.47, "Combination of urad dal (black gram), chana dal (split chickpeas) and kidney beans simmered in a creamy gravy with tomatoes, onions and mild spices."),
        ("Chana Masala", 10.39, "Garbanzo beans cooked with tomatoes, onions and indian spices."),
        ("Vegetable Korma", 12.47, "Mixed vegetables cooked in a delicious creamy gravy."),
        ("Aloo Gobi Masala", 12.47, "Potatoes and cauliflower cooked in North Indian style gravy."),
        ("Bhagara Bhaigan", 12.47, "Eggplant cooked with sesame seeds, peanut and yogurt blended gravy- a rich Hyderabadi dish."),
        ("Bhindi Masala", 12.47, "Made With Okra, onions, cubed tomatoes tossed with Indian spices."),
        ("Palak Paneer / Saag Paneer", 13.51, "Fresh spinach cooked with homemade cheese cubes and spices."),
        ("Shahi Paneer", 13.51, "Pieces of paneer cooked in a delicious creamy gravy with cashew paste and Indian spices."),
        ("Paneer Tikka Masala", 13.51, "Homemade cheese cubes cooked in tomato sauce with cream. A divine touch of special buttery taste."),
        ("Paneer Makhani / Butter Masala", 13.51, "Paneer sauteed in butter and blend of spices."),
        ("Kadai Paneer", 13.51, "Paneer seasoned with our special house ground masala with special kadai masala, onions, bell peppers and tomatoes."),
        ("Kaju Paneer", 13.51, "Paneer seasoned with our special house ground masala and cashew nuts."),
        ("Malai Kofta", 13.51, "Vegetables balls cooked with cream & special sauce."),
        ("Mutter Paneer", 13.51, "Pieced paneer cooked in a delicious creamy gravy with cashew paste and peas."),
        ("Veg Kolhapuri", 12.47, "Vegetables cooked in special homemade spice and spicy gravy."),
    ],
    "ENTRÉES - CHICKEN": [
        ("Egg Masala", 13.51, "Boiled eggs cooked in freshly ground spices with onions served with tomato gravy."),
        ("Kadai Chicken", 15.59, "A northwest frontier specialty chicken cooked with fried curry leaves, onions, green peppers and spices."),
        ("Chicken Vindaloo", 15.59, "Pieces of chicken in a delicious gravy with potatoes and coriander."),
        ("Chicken Shahi Korma", 15.59, "A true mughlai delight, lightly sweet and spicy with a flavor of cardamoms."),
        ("Chicken Tikka Masala", 15.59, "Boneless grilled chicken cooked with tomato, cream and special spices. A divine buttery taste."),
        ("Chicken Mughlai", 15.59, "Pieces of chicken in a delicious creamy gravy with egg and coriander."),
        ("Chicken Chettinadu", 15.59, "Aromatic chicken seasoned with our special spices with onions & tomatoes. Origin of Tamilnadu."),
        ("Chicken Pepper Fry", 15.59, "Pieces of chicken cooked and fried in a south Indian style with spices."),
        ("Chicken Achari", 15.59, "Chicken simmered with tomatoes, onions, then tempered with garlic, cloves and fennel seeds in olive oil."),
        ("Gongura Chicken", 15.59, "Chicken cooked with gongura (red sorrel) leaves and spices."),
        ("Andhra Chicken Curry", 15.59, "Bone-in chicken cooked with tomatoes, caramelized onions & spices in traditional south Indian style."),
        ("Chicken Saag", 15.59, "Boneless chicken cooked with fresh spinach leaves paste, herbs, spices and rich buttery sauce."),
        ("Chicken Kolhapuri", 15.59, "Spicy bone-in chicken cooked with special house made spices and spicy gravy."),
        ("Butter Chicken", 15.59, "Chicken cooked with spices, herbs and butter sauce."),
        ("Chicken Curry", 15.59, "Bone-in chicken cooked with tomatoes, caramelized onions & spices in traditional Indian Style."),
        ("Chicken Afghani", 15.59, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
    ],
    "ENTRÉES - MUTTON": [
        ("Mutton Masala", 19.75, "Tender pieces of goat cooked in freshly ground spices with onions served with tomato gravy."),
        ("Mutton Vindaloo", 19.75, "Pieces of goat simmered in vindaloo paste with diced potatoes and fresh coriander."),
        ("Mutton Korma", 19.75, "A true mughlai delight, goat pieces cooked simmered in spices & creamy gravy with flavor of cardamoms."),
        ("Mutton Mughlai", 19.75, "Pieces of goat cooked in a creamy gravy with shredded eggs and coriander."),
        ("Achari Gosht", 19.75, "Goat simmered with tomatoes, onions then tempered with garlic, cloves and fennel seeds in olive oil."),
        ("Kadai Gosht", 19.75, "A northwest frontier specialty goat curry cooked with fried onions and green peppers and spices."),
        ("Karaikudi Goat Curry", 19.75, "Aromatic goat meat seasoned with our special spices with onions & tomatoes, origin of Tamilnadu."),
        ("Gongura Mutton Curry", 19.75, "Traditional goat cooked with gongura (red sorrel) leaves and special spices."),
        ("Mutton Pepper Fry", 22.87, "Goat served dry with green chillies, curry leaves and special spices."),
        ("Kheema Mutter Masala", 19.75, "Minced goat meat cooked in delicately ground spices with peas and onions. Garnished with coriander."),
        ("Andhra Mutton Curry", 19.75, "Goat cooked with tomatoes, caramelized onions, and spices in traditional south Indian style."),
        ("Mutton Saag", 19.75, "Tender goat cooked with fresh spinach leaves, herbs, spices and rich buttery sauce."),
        ("Mutton Sukka", 22.87, "Dry goat entree tempered with curry leaves and simmered with onions, tomatoes and special spices."),
        ("Dal Gosht", 17.67, "Pieces of goat cooked with channa dal (lentils) and special spices."),
        ("Mutton Paya", 20.79, "Traditional slow-simmered goat trotter soup curry with aromatic spices."),
        ("Kheema Masala", 19.75, "A traditional Indian curry prepared with a fragrant blend of spices and a deeply savory sauce."),
        ("Lamb Vindaloo", 19.75, "Tender lamb simmered with vindaloo spices, potatoes, and a rich hearty sauce."),
        ("Lamb Tikka Masala", 19.75, "Marinated in a spiced yogurt-style blend and cooked until tender with a lightly charred finish."),
    ],
    "ENTRÉES - SEAFOOD": [
        ("Nellore Chepala Pulusu (Fish Curry)", 17.67, "Fish cooked with tamarind and south Indian spices."),
        ("Shrimp Curry", 19.75, "Shrimp cooked in delicately ground spices with onions and tomato gravy."),
        ("Shrimp Pepper Fry", 20.79, "Shrimp pan-roasted with black pepper, curry leaves, and South Indian spices."),
        ("Shrimp Chetinadu", 19.75, "Shrimp cooked in roasted Chettinad spice masala with onions and tomatoes."),
        ("Shrimp Vindaloo", 19.75, "Shrimp simmered with tangy vindaloo paste, spices, and potatoes."),
        ("Shrimp Kolhapuri", 19.75, "Spicy shrimp prepared in traditional Kolhapuri roasted masala gravy."),
        ("Fish Chettinadu", 17.67, "A traditional Indian curry prepared with a fragrant blend of spices and a deeply savory sauce."),
    ],
    "WEEKEND CHEF'S SPECIALTIES": [
        ("Natukodi Biryani", 16.63, "Desi murgi (country chicken) biryani. Served with mirchi ka salan and raita."),
        ("Natukodi Fry", 16.63, "Desi murgi (country chicken). Served with biryani rice."),
        ("Haleem", 14.55, "Haleem is a stew composed of boneless goat, lentils and pounded wheat made into a thick paste. Garnished with boiled egg, fried onions, coriander and butter."),
        ("Bucket Mutton Haleem", 51.99, "Haleem is a stew composed of boneless goat, lentils and pounded wheat made into a thick paste. Bucket serves 3-4 people."),
        ("Family Mutton Haleem", 51.99, "Haleem is a stew composed of boneless goat, lentils and pounded wheat made into a thick paste. Family pack serves 3-4 people."),
        ("Mutton Khichda", 14.55, "Khichda is made with Goat Meat, Varieties Of Lentils And Special Khichda Spices, slowly cooked to a thick paste."),
        ("Mutton Pulao", 16.63, "A hearty meat specialty simmered or cooked with aromatic Indian spices for a rich, robust flavor."),
        ("Chicken Pulao", 13.51, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
        ("Kheema Pulao", 16.63, "A hearty meat specialty simmered or cooked with aromatic Indian spices for a rich, robust flavor."),
        ("Natukodi Pulao", 16.63, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Hyderabadi Mandi Non Veg", 51.99, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Vegetable Pulao", 13.51, "Aromatic rice stir fried with finely chopped cabbage, carrots, bell pepper and other veggies."),
        ("Paneer Pulao", 12.47, "Indian cottage cheese prepared with aromatic spices and a savory, satisfying finish."),
        ("Gutti Vankaya Pulao", 13.51, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Chicken Tikka Pulao", 19.75, "Marinated in a spiced yogurt-style blend and cooked until tender with a lightly charred finish."),
        ("Guntur Chicken Pulao", 15.59, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
        ("Paneer Tikka Pulao", 13.51, "Marinated in a spiced yogurt-style blend and cooked until tender with a lightly charred finish."),
        ("Chicken Pulao Family Tray", 53.03, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
        ("Family Mutton Pulao", 56.15, "A hearty meat specialty simmered or cooked with aromatic Indian spices for a rich, robust flavor."),
    ],
    "SOUTH INDIAN & DOSA SPECIALS": [
        ("Idli (3pcs)", 9.35, "Steemed rice cake served with sambhar (lentils soup), tomato sauce and coconut sauce."),
        ("Plain Dosa", 10.39, "Plain dosa (crepe) served with sambhar (lentils soup), tomato sauce and coconut sauce."),
        ("Onion Dosa", 12.47, "Dosa (crepe) stuffed with onions. Served with sambhar (lentils soup), tomato sauce and coconut sauce."),
        ("Masala Dosa", 13.51, "Dosa (crepe) stuffed with mashed potato. Served with sambhar (lentils soup), tomato sauce and coconut sauce."),
        ("Mysore Masala Dosa", 14.55, "Dosa (crepe) stuffed with mashed potato and spicy mysore chutney. Served with sambhar (lentils soup), tomato sauce and coconut sauce."),
        ("Spring Dosa", 14.55, "Dosa (crepe) stuffed with mixed vegetables and cheese. Served with sambhar (lentils soup), tomato sauce and coconut sauce."),
        ("Cheese Dosa", 13.51, "Plain dosa (crepe) stuffed with cheese. Served with sambhar (lentils soup), tomato sauce and coconut sauce."),
    ],
    "NORTH INDIAN SPECIALS": [
        ("Pav Bhaji", 13.51, "Speciality of Bombay with uniquely curried mixed vegetables served with special Indian bread (pav)."),
        ("Puri Bhaji (2Puris)", 13.51, "Deep fried puffed wheat bread served with mashed potato curry."),
        ("Chole Puri", 13.51, "Deep fried puffed wheat bread served with garbanzo bean curry."),
        ("Chole Bhatura", 13.51, "Puffed bread served with garbanzo bean curry."),
    ],
    "RICE & NAAN": [
        ("Butter Naan", 2.59, "Fresh clay oven bread with butter."),
        ("Garlic Naan", 3.63, "Fresh clay oven bread with butter, cilantro and pinch of garlic topping."),
        ("Chili Garlic Naan", 4.15, "Fresh clay oven bread with butter, cilantro, chili and pinch of garlic topping."),
        ("Puri (2Pcs)", 4.15, "Deep fried puffed bread."),
        ("Bhature", 4.15, "Deep fried puffed bread."),
        ("Butter Tandoori Roti", 2.59, "Fresh clay oven wheat bread with butter."),
        ("Plain Basmati Rice", 4.15, "Steamed or seasoned rice prepared as a versatile accompaniment to curries and grilled specialties."),
        ("Biryani Rice (16oz)", 7.27, "Flavoured biryani dum rice."),
        ("Cheese Naan", 5.19, "Fresh clay oven bread stuffed with cheese."),
        ("Jeera Rice", 5.19, "Steamed or seasoned rice prepared as a versatile accompaniment to curries and grilled specialties."),
        ("Naan (No Butter)", 2.59, "Soft, oven-baked Indian flatbread, ideal for scooping up curries and sauces."),
        ("Tandoori Roti (No Butter)", 2.59, "Marinated with Indian spices and cooked in the intense heat of a traditional tandoor for smoky, charred edges."),
        ("Papad (2pcs)", 5.19, "A thin, crisp lentil wafer, lightly roasted or fried for a crunchy accompaniment."),
    ],
    "DESSERTS": [
        ("Gulab Jamun (2pcs)", 4.15, "Traditional milk pastry dipped in sweet syrup."),
        ("Kulfi", 3.11, "Indian ice-cream (milk popsicles)."),
        ("Gajar Halwa", 4.15, "Carrot pudding."),
        ("Ras Malai (2pcs)", 4.15, "Homemade cheese patties dipped in sweetened milk."),
        ("Mix Ice Gola", 6.23, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Bawarchi Sp. Ice Gola", 7.27, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Strawberry Banana Ice Gola", 6.23, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Pineapple Ice Gola", 6.23, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Fruit Salad", 5.19, "Fresh Fruit Salad."),
        ("Double Ka Meetha", 5.19, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Meetha Paan", 4.15, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
    ],
    "BEVERAGES": [
        ("Indian Tea - Hot (Irani Chai)", 2.59, "A house-menu specialty prepared with traditional Indian flavors, aromatic seasonings and a satisfying balance of texture and taste."),
        ("Soda - Cold", 1.55, "A chilled carbonated beverage, served cold."),
        ("Mango Lassi - Cold", 6.23, "Fresh Mango pulp blend with yogurt and cream."),
        ("Thums Up Can", 3.11, "A chilled carbonated beverage, served cold."),
        ("Bottle Water", 1.55, "Chilled bottled water."),
        ("Chikoo Milkshake", 8.31, "A cool, creamy milk-based drink blended for a smooth, sweet finish."),
        ("Limca", 3.11, "A chilled carbonated beverage, served cold."),
        ("Buttermilk (Chaas)", 4.15, "A refreshing beverage served chilled."),
        ("Madras Coffee", 2.07, "Traditional South Indian filter coffee."),
        ("Jeera Masala Soda", 3.11, "Refreshing spiced cumin masala soda."),
        ("Bawarchi Sp. Falooda", 11.43, "Rich layered rose milk, vermicelli, basil seeds, and ice cream dessert drink."),
        ("Mango Falooda", 10.39, "Rich layered mango milk, vermicelli, basil seeds, and ice cream dessert drink."),
        ("Dry Fruit Falooda", 10.39, "Rich layered dry fruit milk, vermicelli, basil seeds, and ice cream dessert drink."),
        ("Mojito", 3.11, "Refreshing mint lime mojito."),
        ("Mango Drink", 2.07, "A refreshing beverage served chilled."),
        ("Salaam Cola", 3.11, "A chilled carbonated cola beverage."),
    ],
    "ADD ON EXTRA": [
        ("Plain Yogurt", 2.08, "Fresh plain yogurt side."),
        ("Raw Onions", 1.04, "Sliced fresh onions with lemon."),
        ("Raita - 8oz", 2.30, "Cool cucumber & spice yogurt raita."),
        ("Saalan & Raita", 1.30, "Traditional biryani accompaniment."),
        ("Schezwan Sauce", 1.04, "Spicy Indo-Chinese schezwan sauce side."),
        ("Coconut Chutney", 1.04, "Fresh South Indian coconut chutney."),
        ("Mint Sauce", 0.75, "Fresh mint & cilantro chutney."),
        ("Fried Noodles", 1.04, "Crispy fried noodles topping."),
        ("Saalan 8oz", 2.08, "Rich peanut-sesame mirchi ka salan gravy."),
        ("Pav", 2.07, "Buttered soft Indian dinner roll."),
        ("Mango Pickle", 1.04, "Tangy spiced Indian mango pickle."),
        ("Boiled Egg (2)", 2.07, "Two boiled eggs."),
        ("Tamarind Sauce", 0.78, "Sweet and tangy tamarind chutney."),
        ("Curd Rice", 10.39, "Steamed rice tempered with yogurt, mustard seeds, and curry leaves."),
        ("Mayo Sauce", 0.75, "Creamy mayo dip."),
        ("Sambhar Soup", 5.19, "Boiled mixed lentils soup tempered with south indian spices, curry leaves and dry red chillies."),
        ("Extra Egg", 1.04, "Single boiled egg add-on."),
        ("EXTRA", 1.04, "Extra side add-on."),
    ],
    "FAMILY PACK BIRYANI & COMBOS": [
        ("Family Veg Dum Biryani", 42.63, "Fragrant basmati rice layered with aromatic spices and vegetables, cooked in a richly seasoned biryani style."),
        ("Family Paneer Biryani", 44.71, "Fragrant basmati rice layered with aromatic spices and paneer, cooked in a richly seasoned biryani style."),
        ("Family Egg Biryani", 44.71, "Fragrant basmati rice layered with aromatic spices and eggs, cooked in a richly seasoned biryani style."),
        ("Family Vijayawada Boneless Chicken Biryani", 53.03, "Fragrant basmati rice layered with aromatic spices and boneless chicken, cooked in a richly seasoned biryani style."),
        ("Family Goat Dum Biryani", 56.15, "Fragrant basmati rice layered with aromatic spices and tender goat, cooked in a richly seasoned biryani style."),
        ("Family Kheema Biryani", 57.19, "Fragrant basmati rice layered with aromatic spices and minced goat kheema, cooked in a richly seasoned biryani style."),
        ("Family Shrimp Biryani", 57.19, "Fragrant basmati rice layered with aromatic spices and shrimp, cooked in a richly seasoned biryani style."),
        ("Family Chicken Dum Biryani", 48.87, "Fragrant basmati rice layered with aromatic spices and chicken, cooked in a richly seasoned biryani style."),
        ("Family Natukodi Biryani", 57.19, "Fragrant basmati rice layered with aromatic spices and country chicken, cooked in a richly seasoned biryani style."),
        ("Family Veg Paneer Biryani", 44.71, "Fragrant basmati rice layered with aromatic spices, vegetables and paneer, cooked in a richly seasoned biryani style."),
        ("Family Chicken Tikka Biryani", 57.19, "Fragrant basmati rice layered with aromatic spices and grilled chicken tikka, cooked in a richly seasoned biryani style."),
        ("Hyderabadi Style Tandoori Mandi", 103.99, "Marinated with Indian spices and cooked in the intense heat of a traditional tandoor for smoky, charred edges."),
        ("Combo Chicken Biryani", 11.43, "This Combo Pack Comes With Chicken Dum Biryani, Chicken 65, 1 Gulab Jamun & Raita."),
        ("Combo Veggie Biryani", 11.43, "This Combo Pack Comes With Veg. Dum Biryani, Gobi Manchurian, 1 Gulab Jamun & Raita."),
        ("Lunch Special Combo", 13.51, "Choose Any 2 Option for Curry."),
        ("Ramadan Spl Combo Box #1", 16.63, "Choose Any 1 Option for Appetizer."),
        ("Ramadan Spl Combo Box #2", 16.63, "Choose Any 1 Appetizer."),
        ("Combo Special Veg Appetizer", 14.55, "Includes Gobi Manchurian + Veg Samosa + 1 Butter Naan."),
        ("Combo Special Chicken Appetizer", 15.59, "Includes Curry Leaves Chicken + Chicken Samosa + 1 Butter Naan."),
        ("Family Feast", 46.79, "Choice of 1 curry + 1 appetizer + 2 naan + dal + 2 dessert (Ras Malai, Gulab Jamun or Gajar Halwa) or Tea or Kulfi."),
        ("Early-Bird Dinner (Friday-Sat, 4-6pm)", 34.31, "Special Friday-Saturday Early-Bird Dinner combo from 4-6pm."),
        ("Date Night for 2 (Sun-Thu 6 PM Onwards)", 34.31, "Special Date Night dinner for two (Sunday-Thursday, 6 PM onwards)."),
    ],
    "WRAPS": [
        ("Kheema Pav", 13.51, "Minced goat meat served with Indian bread (pav)."),
        ("Veggie Wrap", 9.35, "Mixed veggies wrapped in tandoor naan (clay oven bread). Served with mint sauce."),
        ("Paneer Tikka Wrap", 10.39, "Paneer tikka (grilled Indian cottage cheese) wrapped in tandoor naan (clay oven bread). Served with mint sauce."),
        ("Chicken Tikka Wrap", 10.39, "Chicken tikka wrapped in tandoor naan (clay oven bread). Served with mint sauce."),
        ("Kheema Wrap", 13.51, "Minced goat meat wrapped in tandoor naan (clay oven bread). Served with mint sauce."),
        ("Chicken 65 Wrap", 11.43, "Chicken 65, veggies and special sauce wrapped in tandoor naan (clay oven bread). Served with mint sauce."),
        ("Chicken 555 Wrap", 13.51, "Chicken 555 wrapped in tandoor naan (clay oven bread). Served with mint sauce."),
        ("Malai Tikka Wrap", 11.43, "Marinated in a spiced yogurt-style blend and cooked until tender with a lightly charred finish."),
        ("Chicken Seekh Kabab Wrap", 14.55, "Chicken seasoned with Indian spices and prepared in the style named, from crisp and spicy to rich and saucy."),
    ],
}

NON_VEG_KEYWORDS = ("chicken", "mutton", "goat", "lamb", "kheema", "shrimp", "fish", "egg", "natukodi", "haleem", "khichda", "gosht", "paya", "non veg", "mandi")
SEAFOOD_KEYWORDS = ("shrimp", "fish", "chepala")
SPICY_KEYWORDS = ("chili", "chilli", "schezwan", "spicy", "65", "555", "999", "vindaloo", "kolhapuri", "karampodi", "pepper", "mirch", "andhra", "guntur", "mysore", "chettinadu", "chetinadu", "sukka", "majestic")
MILD_KEYWORDS = ("malai", "korma", "butter", "makhani", "shahi", "sweet", "lassi", "kulfi", "gulab", "ras malai", "halwa", "falooda", "milkshake", "ice gola", "plain", "curd", "yogurt", "raita", "idli", "cheese")


def infer_tags(cat_name: str, item_name: str, desc: str):
    text = f"{cat_name} {item_name} {desc}".lower()
    tags = []
    if any(k in text for k in SEAFOOD_KEYWORDS):
        tags.append(("Seafood", "dietary"))
        tags.append(("Non-Vegetarian", "dietary"))
    elif any(k in text for k in NON_VEG_KEYWORDS):
        tags.append(("Non-Vegetarian", "dietary"))
    else:
        tags.append(("Vegetarian", "dietary"))

    if any(k in text for k in SPICY_KEYWORDS):
        tags.append(("Spicy", "spice_level"))
    elif any(k in text for k in MILD_KEYWORDS):
        tags.append(("Mild", "spice_level"))
    return tags


def run_import():
    db = SessionLocal()
    try:
        # 1. Update Restaurant #1 to Bawarchi Indian Cuisine
        rest = db.query(models.Restaurant).first()
        if not rest:
            rest = models.Restaurant(name="Bawarchi Indian Cuisine", location="Decatur", settings={})
            db.add(rest)
            db.flush()
        else:
            rest.name = "Bawarchi Indian Cuisine"
            rest.location = "Decatur"
            rest.settings = {
                "currency": "$",
                "tagline": "Good Food • Good Mood",
                "welcome_message": "Welcome to Bawarchi Indian Cuisine! Authentic Indian Flavors, Fresh Ingredients, Great Taste.",
                "theme_color": "#EA580C",
            }

        # 2. Ensure Languages exist
        for code, lname in [("en", "English"), ("hi", "हिन्दी (Hindi)"), ("es", "Español"), ("fr", "Français")]:
            if not db.query(models.Language).filter(models.Language.language_code == code).first():
                db.add(models.Language(language_code=code, language_name=lname, is_active=True))

        # 3. Ensure Tables 1-8 exist
        if db.query(models.RestaurantTable).filter(models.RestaurantTable.restaurant_id == rest.id).count() == 0:
            for tnum in range(1, 9):
                db.add(models.RestaurantTable(
                    restaurant_id=rest.id,
                    table_number=tnum,
                    qr_identifier=f"bawarchi-table-{tnum}",
                    is_active=True,
                ))

        # 4. Clear existing menu items/categories cleanly before importing Bawarchi menu
        db.query(models.DailyMenuAvailability).delete()
        db.query(models.MenuItemTag).delete()
        db.query(models.MenuItem).delete()
        db.query(models.MenuCategory).delete()
        db.query(models.Offer).delete()
        db.flush()

        total_items = 0
        for cat_name, items in BAWARCHI_MENU.items():
            cat = models.MenuCategory(restaurant_id=rest.id, name=cat_name, description="Bawarchi Indian Cuisine")
            db.add(cat)
            db.flush()

            for item_name, price, desc in items:
                mi = models.MenuItem(
                    restaurant_id=rest.id,
                    category_id=cat.id,
                    name=item_name,
                    description=desc,
                    price=price,
                    is_active=True,
                )
                db.add(mi)
                db.flush()
                total_items += 1

                for tag_name, tag_type in infer_tags(cat_name, item_name, desc):
                    db.add(models.MenuItemTag(menu_item_id=mi.id, tag_name=tag_name, tag_type=tag_type))

        # 5. Add Bawarchi Special Offers
        today = date.today()
        offers_data = [
            ("Early-Bird Dinner (Fri-Sat, 4-6pm)", "Enjoy our Early-Bird Dinner special for $34.31 every Friday & Saturday from 4:00 PM to 6:00 PM.", 34.31),
            ("Date Night for 2 (Sun-Thu 6 PM+)", "Special Date Night dinner for two for $34.31 every Sunday through Thursday from 6:00 PM onwards.", 34.31),
            ("Lunch Special Combo", "Choose any 2 curries with our Lunch Special Combo for $13.51.", 13.51),
            ("Family Feast", "1 Curry + 1 Appetizer + 2 Naan + Dal + 2 Desserts (or Tea/Kulfi) for $46.79.", 46.79),
        ]
        for title, desc, val in offers_data:
            db.add(models.Offer(
                restaurant_id=rest.id,
                title=title,
                description=desc,
                discount_value=val,
                start_date=today,
                end_date=today + timedelta(days=90),
                is_active=True,
            ))

        db.commit()
        print(f"Imported Bawarchi Indian Cuisine: {len(BAWARCHI_MENU)} categories, {total_items} menu items, {len(offers_data)} offers!")
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_import()
