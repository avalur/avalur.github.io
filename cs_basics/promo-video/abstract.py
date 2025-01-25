from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.gtts import GTTSService

ts_service = GTTSService(lang="en", tld="com")
# ts_service = AzureService(
#                 voice="en-US-JennyNeural",
#                 style="newcast-casual",
#             )

def finishScene(self):
    self.play(*[FadeOut(mob) for mob in self.mobjects])


class Intro(VoiceoverScene):
    def construct(self):
        # Set up voice service
        self.set_speech_service(ts_service)

        # Create a main title
        title = Text("Programming Paradigms course", font_size=48)
        subtitle = Text("Beyond the Code", font_size=36, color=BLUE)

        title_group = VGroup(title, subtitle).arrange(DOWN)
        title_group.to_edge(UP)

        # Create the toolbox metaphor
        img1 = ImageMobject("../images/hammer-isolated-black-background.png")
        img1.scale(1.2)
        img1.to_edge(LEFT*4+DOWN*3, buff=0.5)

        # Create paradigms boxes
        paradigms = VGroup(
            *[create_paradigm_box(name, description) for name, description in [
                ("Procedural", "Step-by-step recipe approach"),
                ("Functional", "Mathematical elegance"),
                ("Logic", "Power of reasoning"),
                ("Object-Oriented", "Real-world modeling")
            ]]
        ).arrange(DOWN, buff=0.5)
        paradigms.to_edge(LEFT)

        # Languages section
        languages = VGroup(
            Text("Hands-on Experience:", font_size=36),
            create_language_list([
                "C++ for procedural",
                "Haskell for functional",
                "Prolog for logic",
                "Java and Python for OOP"
            ])
        ).arrange(DOWN, aligned_edge=LEFT)
        languages.next_to(paradigms, RIGHT, buff=1)

        with self.voiceover(text="""
            Imagine having only a hammer in your toolbox.
            Every problem would look like a nail, wouldn't it?
            That's why in programming, we need multiple tools - or as we call them, paradigms!
        """) as tracker:
            # Animate title
            self.play(Write(title_group))

            # Animate toolbox metaphor
            self.play(
                img1.animate.rotate(-60 * DEGREES).shift(RIGHT * 6),
                run_time=6
            )

        with self.voiceover(text="""
            We'll explore four major paradigms that shape modern software development.
        """) as tracker:
            # Fade out toolbox and animate paradigms
            self.play(
                FadeOut(title_group),
                FadeOut(img1),
                run_time=2
            )
            self.play(
                Write(paradigms),
                run_time=4
            )

        with self.voiceover(text="""
            You'll get hands-on experience with classic languages like C++, Haskell, Prolog,
            and object-oriented languages like Java and Python.
        """) as tracker:
            # Animate languages section
            self.play(
                Write(languages),
                run_time=8
            )

        # Final pause
        self.wait(2)

        # Fade everything out
        self.play(*[FadeOut(mob) for mob in self.mobjects])


def create_paradigm_box(name, description):
    box = VGroup(
        Text(name, font_size=32, color=BLUE),
        Text(description, font_size=24, color=WHITE)
    ).arrange(DOWN, buff=0.2)

    background = SurroundingRectangle(box, buff=0.3, color=BLUE_A)
    return VGroup(background, box)


def create_language_list(items):
    return VGroup(
        *[Text(f"• {item}", font_size=24) for item in items]
    ).arrange(DOWN, aligned_edge=LEFT)


class Teachers(VoiceoverScene):
    def construct(self):
        self.set_speech_service(GTTSService(lang="en", tld="com"))

        # Main title
        title = Text("Meet Your Instructors", font_size=48)
        title.to_edge(UP)
        title_underline = Line(
            start=title.get_left(),
            end=title.get_right(),
            color=BLUE
        ).next_to(title, DOWN, buff=0.1)

        # Create teacher profiles
        teachers_data = [
            {
                "name": "Alex Avdiushenko",
                "photo_path": "../images/avalur_2024.png",
                "specialization": "Python and Java",
                "experience": "Expert in AI and education",
            },
            {
                "name": "Tanya Berlenko",
                "photo_path": "../images/berlenko.jpg",
                "specialization": "Prolog and C++",
                "experience": "Expert in Robotics",
            },
            {
                "name": "Vitaly Bragilevsky",
                "photo_path": "../images/bragilevsky.jpg",
                "specialization": "Functional Programming",
                "experience": "Author of 'Haskell in Depth'",
            }
        ]

        teacher_profiles = self.create_teacher_profiles(teachers_data)
        teacher_profiles.arrange(RIGHT, buff=0.5)
        teacher_profiles.next_to(title, DOWN, buff=1)

        # Animation sequence
        with self.voiceover(text="""
            Let us introduce you to our exceptional team of instructors 
            who will guide you through the programming paradigms.
        """) as tracker:
            self.play(
                Write(title),
                Create(title_underline),
                run_time=3
            )

        # Animate each teacher profile
        for i, profile in enumerate(teacher_profiles):
            teacher_data = teachers_data[i]
            with self.voiceover(text=f"""
                Meet {teacher_data['name']}, {teacher_data['specialization']}.
                {teacher_data['experience']}.
            """) as tracker:
                self.play(
                    FadeIn(profile, shift=UP),
                    run_time=3
                )

        # Final group shot
        with self.voiceover(text="""
            Together, they bring decades of experience in both academia and industry,
            ensuring you get the best possible understanding of different programming paradigms.
        """) as tracker:
            # Add subtle movement to emphasize the team
            self.play(
                *[
                    profile.animate.scale(1.1)
                    for profile in teacher_profiles
                ],
                run_time=2
            )
            self.play(
                *[
                    profile.animate.scale(1 / 1.1)
                    for profile in teacher_profiles
                ],
                run_time=2
            )

        self.wait(2)
        self.play(*[FadeOut(mob) for mob in self.mobjects])

    def create_teacher_profiles(self, teachers_data):
        profiles = Group()

        for teacher in teachers_data:
            try:
                photo = ImageMobject(teacher["photo_path"])
                photo.set_height(2.8)
            except:
                # Fallback if image not found
                photo = Rectangle(
                    height=3,
                    width=2.5,
                    color=BLUE_C,
                    fill_opacity=0.3
                )
                placeholder_text = Text("Photo", font_size=24)
                placeholder_text.move_to(photo.get_center())
                photo = VGroup(photo, placeholder_text)

            # Create text elements
            name = Text(teacher["name"], font_size=24, color=BLUE)
            specialization = Text(
                teacher["specialization"],
                font_size=20,
                color=WHITE
            )
            experience = Text(
                teacher["experience"],
                font_size=18,
                color=LIGHT_GRAY
            )

            # Create text group
            text_group = VGroup(name, specialization, experience)
            text_group.arrange(DOWN, buff=0.2, aligned_edge=LEFT)

            # Create background card
            card = Rectangle(
                height=4.5,
                width=3,
                fill_color=DARKER_GRAY,
                fill_opacity=0.5,
                stroke_color=BLUE_E
            )

            # Arrange elements
            profile = Group(card)
            photo.move_to(card.get_top() + DOWN * 1.2)
            text_group.next_to(photo, DOWN, buff=0.3)
            text_group.set_width(card.width - 0.4)

            profile.add(photo, text_group)
            profiles.add(profile)

        return profiles


class GenerativeAI(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background image setup
        background = ImageMobject("../images/LLM_sizes.png")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Main title
        title = Tex("Generative AI and Large Language Models")
        title.scale(1.4)
        title.to_edge(UP)
        title.set_color_by_gradient(WHITE, PURPLE)  # Changed to purple for a different theme
        title_box = BackgroundRectangle(title, color=BLACK, fill_opacity=0.7)

        with self.voiceover(
                text="""
                Explore the architectures powering modern AI:
                - Variational Autoencoders and GANs
                - Tokenization and embedding techniques
                - Multi-agent systems
                - Build practical solutions for LLM challenges
                """
        ) as tracker:
            # Fade in background
            self.play(
                FadeIn(background),
                run_time=3
            )

            # Animate title
            self.play(
                FadeIn(title_box),
                Write(title),
                run_time=3
            )

            # Create bullet points
            bullets = VGroup(
                Tex("• Variational Autoencoders (VAEs) and GANs"),
                Tex("• Tokenization and embedding techniques"),
                Tex("• Multi-agent systems and AI orchestration"),
                Tex("• Practical solutions for LLM challenges")
            ).arrange(DOWN, aligned_edge=LEFT, buff=0.5)
            bullets.next_to(title, DOWN, buff=1)

            # Add background boxes for better readability
            bullet_boxes = VGroup(*[
                BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
                for bullet in bullets
            ])

            # Animate bullets one by one
            for box, bullet in zip(bullet_boxes, bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=1.5
                )

        self.wait()
        finishScene(self)


class CapstoneProjects(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background image setup
        background = ImageMobject("../images/capstone_background_Grok.jpg")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Main title
        main_title = Tex("Capstone Projects")
        main_title.scale(1.4)
        main_title.to_edge(UP)
        main_title.set_color_by_gradient(WHITE, GREEN)
        main_title_box = BackgroundRectangle(main_title, color=BLACK, fill_opacity=0.7)

        with self.voiceover(
                text="""
                Let's explore two exciting capstone projects that will put your skills to the test.
                First, you'll build your own AlphaZero-like Game AI, and then develop a personal AI assistant.
                """
        ) as tracker:
            # Fade in background and main title
            self.play(
                FadeIn(background),
                FadeIn(main_title_box),
                Write(main_title),
                run_time=6
            )

        # Project 1
        project1_title = Tex("1. Build Your Own Game AI")
        project1_title.scale(0.8)
        project1_title.next_to(main_title, DOWN, buff=0.8)
        project1_title.set_color(BLUE)
        project1_box = BackgroundRectangle(project1_title, color=BLACK, fill_opacity=0.7)

        project1_bullets = VGroup(
            Tex("• Implement self-play mechanisms"),
            Tex("• Design neural network architectures"),
            Tex("• Apply reinforcement learning principles")
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        project1_bullets.scale(0.8)
        project1_bullets.next_to(project1_title, DOWN, buff=0.5)

        # Project 2
        project2_title = Tex("2. Personal voice AI Assistant")
        project2_title.scale(0.8)
        project2_title.next_to(project1_bullets, DOWN, buff=0.8)
        project2_title.set_color(BLUE)
        project2_box = BackgroundRectangle(project2_title, color=BLACK, fill_opacity=0.7)

        project2_bullets = VGroup(
            Tex("• Voice recognition and synthesis"),
            Tex("• LLM integration"),
            Tex("• Performance optimization"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        project2_bullets.scale(0.8)
        project2_bullets.next_to(project2_title, DOWN, buff=0.5)

        # Add background boxes for better readability
        p1_bullet_boxes = VGroup(*[
            BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
            for bullet in project1_bullets
        ])
        p2_bullet_boxes = VGroup(*[
            BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
            for bullet in project2_bullets
        ])

        with self.voiceover(
                text="""
                The first project challenges you to build an AlphaZero-style AI that masters classic games.
                You'll implement self-play mechanisms, design neural network architectures,
                and apply reinforcement learning principles.
                """
        ) as tracker:
            # Animate Project 1
            self.play(
                FadeIn(project1_box),
                Write(project1_title),
                run_time=4
            )

            # Animate Project 1 bullets
            for box, bullet in zip(p1_bullet_boxes, project1_bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=3
                )

        with self.voiceover(
                text="""
                The second project involves developing your own personal voice AI assistant.
                You'll work on voice recognition and synthesis, LLM integration,
                performance optimization, and system architecture design.
                """
        ) as tracker:
            # Animate Project 2
            self.play(
                FadeIn(project2_box),
                Write(project2_title),
                run_time=4
            )

            # Animate Project 2 bullets
            for box, bullet in zip(p2_bullet_boxes, project2_bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=3
                )

        self.wait()
        finishScene(self)


class FinalScene(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background setup with a gradient effect
        background = ImageMobject("../images/Wall-E-from-Grok.jpg")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Create the main message text, split into parts for dramatic effect
        message_part1 = Text(
            "Join us to master the technologies shaping our future.",
            font_size=40
        )

        message_part2 = Text(
            "Whether you're aiming to innovate in AI research\nor build practical applications with it.",
            font_size=36
        )

        message_part3 = Text(
            "This course provides the advanced skills you need to succeed.",
            font_size=40
        )

        # Arrange the text parts vertically
        message_group = VGroup(
            message_part1,
            message_part2,
            message_part3
        ).arrange(DOWN, buff=0.8)

        # Center the entire text group
        message_group.center()

        # Add gradient colors to make it visually appealing
        message_part1.set_color_by_gradient(BLUE, WHITE)
        message_part2.set_color(WHITE)
        message_part3.set_color_by_gradient(WHITE, BLUE)

        # Create background boxes for better readability
        boxes = VGroup(*[
            BackgroundRectangle(text, color=BLACK, fill_opacity=0.7)
            for text in [message_part1, message_part2, message_part3]
        ])

        with self.voiceover(
                text="""
                Join us to master the technologies shaping our future. 
                Whether you're aiming to innovate in AI research or 
                build practical applications with it, 
                this course provides the advanced skills you need to succeed.
                """
        ) as tracker:
            # Fade in the background with a slight zoom effect
            self.play(
                FadeIn(background),
                run_time=2
            )

            # Animate each part of the message sequentially
            # Part 1
            self.play(
                FadeIn(boxes[0]),
                Write(message_part1),
                run_time=2
            )

            # Part 2
            self.play(
                FadeIn(boxes[1]),
                Write(message_part2),
                run_time=6
            )

            # Part 3 with a special emphasis
            self.play(
                FadeIn(boxes[2]),
                Write(message_part3),
                run_time=2
            )

            # Add a subtle pulsing effect to emphasize the final message
            self.play(
                *[
                    box.animate.scale(1.05).set_opacity(0.8)
                    for box in boxes
                ],
                *[
                    text.animate.scale(1.05)
                    for text in [message_part1, message_part2, message_part3]
                ],
                run_time=1
            )

            self.play(
                *[
                    box.animate.scale(1 / 1.05).set_opacity(0.7)
                    for box in boxes
                ],
                *[
                    text.animate.scale(1 / 1.05)
                    for text in [message_part1, message_part2, message_part3]
                ],
                run_time=1
            )

        # Hold the final frame for a moment
        self.wait(2)
        finishScene(self)


class Full(VoiceoverScene):
    def construct(self):
        Start.construct(self)
        RL.construct(self)
        GenerativeAI.construct(self)
        CapstoneProjects.construct(self)
        FinalScene.construct(self)
