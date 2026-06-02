---
tags:
  - public
---

I saw on X sometime ago, how you can improve the copy to clipboard animation using blur - So I decided to try it out.
<iframe
  height="500"
  style="width: 100%;"
  scrolling="no"
  title="Pen"
  src="https://codepen.io/yxshv/embed/vEymKVe?default-tab=result"
  frameborder="no"
  loading="lazy"
  allowtransparency="true"
  allowfullscreen="true">
</iframe>

After making the copy to clipboard button animation with blur, it felt like something was wrong. So, I thought why not try to add this button somewhere and see how it fits?

So, I added a code snippet beside. But while doing that I was stuck on the design of the code block.

### Why does it feel right?
I tried something else earlier, but it just did not feel right

![Pasted image 20260520213220](/attachments/pasted-image-20260520213220.png)

So I looked at Emil Kowalski's work and saw this

![Screenshot 2026-05-20 at 9.12.56 PM](/attachments/screenshot-2026-05-20-at-9.12.56-pm.png)

And looking at this, it looked so good. And fits completely perfectly.

And now I am thinking why???

1. I think the border feels un-natural, it does not blend in well with the light background. Instead a lighter border of box-shadow feels better.
2. And the text sticks out too much, the font colour needs to be lighter (But why?)
3. After fixing that stuff, the border radius feels off (why exactly though?)
4. Emil's version has a solid tick while mine has a outline tick, her implementation feels better, but why?

Answers to these
1. A solid black border from a white background, does not fit. The rest of the UI (the copy button and the background) is trying to show subtle separation from one another, but the black border breaks that, by making a sudden jump from completely white to black.
2. Same reason as before
3. The border radius makes it feel like an input. (from Claude)
4. The tick on clicking the button is a feedback to the user, that this has worked. And my icon makes it feel like something subtle, but Emil's version makes its stick, it has intentionally dark and high contrast because its trying to grab the attention.

Then I later optimised it more, added more scale down. Also got rid of that weird blur effect when tick changes back to the copy icon.