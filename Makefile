.PHONY: build clean

build: style.min.css script.min.js vicious-viper/vicious-viper.min.css

style.min.css: style.css
	npx csso-cli $< -o $@

script.min.js: script.js
	npx terser $< -o $@ --compress --mangle

vicious-viper/vicious-viper.min.css: vicious-viper/vicious-viper.css
	npx csso-cli $< -o $@

clean:
	rm -f style.min.css script.min.js vicious-viper/vicious-viper.min.css
