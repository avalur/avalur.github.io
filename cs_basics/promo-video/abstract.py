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

def create_paradigm_box(name, description):
    box = VGroup(
        Tex(name, font_size=32, color=BLUE),
        Tex(description, font_size=24, color=WHITE)
    ).arrange(DOWN, buff=0.2)

    background = SurroundingRectangle(box, buff=0.3, color=BLUE_A)
    return VGroup(background, box)

def create_language_list(items):
    return VGroup(
        *[Tex(f"• {item}", font_size=24) for item in items]
    ).arrange(DOWN, aligned_edge=LEFT)


class Intro(VoiceoverScene):
    def construct(self):
        # Set up voice service
        self.set_speech_service(ts_service)

        # Create a main title
        title = Tex("Programming Paradigms course", font_size=48)
        subtitle = Tex("Beyond the Code", font_size=36, color=BLUE)

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
            Tex("Hands-on Experience:", font_size=36),
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


def create_teacher_profiles(teachers_data):
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
            placeholder_text = Tex("Photo", font_size=24)
            placeholder_text.move_to(photo.get_center())
            photo = VGroup(photo, placeholder_text)

        # Create text elements
        name = Tex(teacher["name"], font_size=24, color=BLUE)
        specialization = Tex(
            teacher["specialization"],
            font_size=20,
            color=WHITE
        )
        experience = Tex(
            teacher["experience"],
            font_size=18,
            color=LIGHT_GRAY
        )

        # Create a text group
        text_group = VGroup(name, specialization, experience)
        text_group.arrange(DOWN, buff=0.2, aligned_edge=LEFT)

        # Create a background card
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


class Teachers(VoiceoverScene):
    def construct(self):
        self.set_speech_service(GTTSService(lang="en", tld="com"))

        # Main title
        title = Tex("Meet Your Instructors", font_size=48)
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
                "specialization": "Prolog",
                "experience": "Expert in Robotics",
            },
            {
                "name": "Vitaly Bragilevsky",
                "photo_path": "../images/bragilevsky.jpg",
                "specialization": "Functional Programming",
                "experience": "Author of 'Haskell in Depth'",
            },
            {
                "name": "Kirill Krinkin",
                "photo_path": "../images/krinkin.jpg",
                "specialization": "C++",
                "experience": "Expert in CS",
            }
        ]

        teacher_profiles = create_teacher_profiles(teachers_data)
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


class RealWorldRelevance(VoiceoverScene):
    def construct(self):
        self.set_speech_service(ts_service)

        # Title
        title = Tex("Real-World Relevance", font_size=40)
        subtitle = Tex("Why learn multiple paradigms?", font_size=32, color=BLUE)

        title_group = VGroup(title, subtitle).arrange(DOWN)
        title_group.to_edge(UP)

        # Create examples with company logos and descriptions
        examples = [
            ("Haskell", "Facebook uses it for spam fighting", "../images/facebook_logo.png"),
            ("Prolog", "IBM Watson's reasoning engine", "../images/ibm_logo.png"),
            ("Java", "Runs on 3 billion devices", "../images/java.logo.webp"),
            ("Python", "Drives AI and Data Science", "../images/python_logo.png")
        ]

        # Create example boxes
        example_boxes = []
        for lang, desc, logo_path in examples:
            # Create text elements
            lang_text = Tex(lang, font_size=28, color=BLUE)
            desc_text = Tex(desc, font_size=20)

            # Try to load logo, use fallback if image not found
            try:
                logo = ImageMobject(logo_path)
                logo.set_height(1)
            except:
                logo = Tex("Logo", font_size=24, color=GRAY)

            # Create and style box
            box_content = Group(
                logo,
                lang_text,
                desc_text
            ).arrange(DOWN, buff=0.1)

            background = SurroundingRectangle(
                box_content,
                buff=0.3,
                stroke_color=BLUE_A,
                fill_color=DARKER_GRAY,
                fill_opacity=0.3
            )

            example_box = Group(background, box_content)
            example_boxes.append(example_box)

        # Arrange boxes in a grid (2x2)
        boxes_group = Group(*example_boxes).arrange_in_grid(rows=2, cols=2, buff=0.25)
        boxes_group.next_to(title_group, DOWN, buff=0.25)

        # Animation sequence
        with self.voiceover(text="""
            Why should you learn multiple programming paradigms?
            Let's look at how they're used in the real world.
        """) as tracker:
            self.play(
                Write(title_group),
                run_time=3
            )

        # Animate each example box
        for i, box in enumerate(example_boxes):
            example = examples[i]
            with self.voiceover(text=f"""
                {example[0]} is used in industry where {example[1]}.
            """) as tracker:
                self.play(
                    FadeIn(box, shift=UP),
                    run_time=2
                )

        # Final emphasis
        with self.voiceover(text="""
            Each paradigm brings its own strengths to solve different types of problems.
        """) as tracker:
            # Add subtle pulsing animation to all boxes
            self.play(
                *[box.animate.scale(1.1) for box in example_boxes],
                run_time=1
            )
            self.play(
                *[box.animate.scale(1 / 1.1) for box in example_boxes],
                run_time=1
            )

        self.wait(2)
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
                During the course you will implement and present 
                two exciting capstone projects that will put your skills to the test. . .
                
                First, you'll build your own idea in Prolog, and then also develop 
                an audiosystem in Java with O.O.P.
                """
        ) as tracker:
            # Fade in background and main title
            self.play(
                FadeIn(background),
                FadeIn(main_title_box),
                Write(main_title),
                run_time=4
            )

        # Project 1
        project1_title = Tex("1. Project in Prolog")
        project1_title.scale(0.8)
        project1_title.next_to(main_title, DOWN, buff=0.8)
        project1_title.set_color(BLUE)
        project1_box = BackgroundRectangle(project1_title, color=BLACK, fill_opacity=0.7)

        project1_bullets = VGroup(
            Tex("• Suggest your own project to implement"),
            Tex("• Use Prolog \\texttt{:)}"),
            Tex("• Apply best practices")
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        project1_bullets.scale(0.8)
        project1_bullets.next_to(project1_title, DOWN, buff=0.5)

        # Project 2
        project2_title = Tex("2. Audio Processing System")
        project2_title.scale(0.8)
        project2_title.next_to(project1_bullets, DOWN, buff=0.8)
        project2_title.set_color(BLUE)
        project2_box = BackgroundRectangle(project2_title, color=BLACK, fill_opacity=0.7)

        project2_bullets = VGroup(
            Tex("• Audio processing in Java with OOP"),
            Tex("• Unit and integration testing"),
            Tex("• Logging and visualizations"),
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
                The first project challenges you to build your own idea in Prolog.
                You will suggest your own project to implement,
                and will apply best programming practices.
                """
        ) as tracker:
            # Animate Project 1
            self.play(
                FadeIn(project1_box),
                Write(project1_title),
                run_time=2
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
                The second project involves developing Audiosystem in Java with O.O.P. . .
                
                You'll work on audio, enterprise-like Java project, unit and integration testing, 
                and system architecture design.
                """
        ) as tracker:
            # Animate Project 2
            self.play(
                FadeIn(project2_box),
                Write(project2_title),
                run_time=2
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
        background = ImageMobject("../images/matrix_from_Grok.jpg")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Create and display a course structure section
        structure_title = Tex("Course Structure", font_size=40, color=BLUE)
        structure_title.to_edge(UP)

        structure_points = VGroup(
            Tex("13 weeks of intensive learning", font_size=30),
            Tex("Balanced mix of theory and practice", font_size=30),
            Tex("Two project defenses", font_size=30),
            Tex("Comprehensive final exam", font_size=30)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        structure_points.next_to(structure_title, DOWN, buff=0.5)

        # Add bullet points
        bullets = VGroup(*[
            Tex("•", font_size=30).next_to(point, LEFT, buff=0.2)
            for point in structure_points
        ])

        structure_group = VGroup(structure_points, bullets)

        # Create and position learning outcomes section
        outcomes_title = Tex("Learning Outcomes", font_size=40, color=BLUE)
        outcomes_title.next_to(structure_points, DOWN, buff=0.5)

        outcomes_points = VGroup(
            Tex("Think in multiple programming dimensions", font_size=30),
            Tex("Choose the right tool for each problem", font_size=30),
            Tex("Understand the evolution of programming", font_size=30),
            Tex("Master modern programming patterns", font_size=30)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        outcomes_points.next_to(outcomes_title, DOWN, buff=0.5)

        # Add bullet points for outcomes
        outcomes_bullets = VGroup(*[
            Tex("•", font_size=30).next_to(point, LEFT, buff=0.2)
            for point in outcomes_points
        ])

        outcomes_group = VGroup(outcomes_points, outcomes_bullets)

        # Create background boxes for better readability
        boxes = VGroup(*[
            BackgroundRectangle(text, color=GRAY, fill_opacity=0.7)
            for text in [structure_title, outcomes_title]
        ])

        # Animation sequence
        with self.voiceover(text="""
            Finally let's look at how the course is structured.
            Over 13 weeks, you'll experience an intensive learning journey,
            with a careful balance of theory and practice.
            You'll defend two projects and complete a comprehensive final exam.
        """) as tracker:
            self.play(
                FadeIn(background),
                run_time=1
            )

            self.play(
                FadeIn(boxes[0]),
                Write(structure_title),
                run_time=4
            )

            # Animate each structure point
            for point, bullet in zip(structure_points, bullets):
                self.play(
                    FadeIn(bullet),
                    Write(point),
                    run_time=2.5
                )

        # Animate outcomes section
        with self.voiceover(text="""
            By the end of this course, you'll be able to think in multiple programming dimensions,
            choose the right tool for each problem,
            understand how programming has evolved,
            and master modern programming patterns.
        """) as tracker:
            self.play(
                FadeIn(boxes[1]),
                Write(outcomes_title),
                run_time=4
            )

            # Animate each outcome point
            for point, bullet in zip(outcomes_points, outcomes_bullets):
                self.play(
                    FadeIn(bullet),
                    Write(point),
                    run_time=2.5
                )

        # Final emphasis animation
        all_points = VGroup(structure_group, outcomes_group)
        self.play(
            all_points.animate.scale(1.05),
            run_time=1
        )
        self.play(
            all_points.animate.scale(1 / 1.05),
            run_time=1
        )

        # Add background rectangles for better visibility
        for point in [*structure_points, *outcomes_points]:
            background = BackgroundRectangle(
                point,
                fill_opacity=0.1,
                buff=0.1,
                color=BLUE_E
            )
            self.bring_to_back(background)

        self.wait(2)
        finishScene(self)


class Full(VoiceoverScene):
    def construct(self):
        Intro.construct(self)
        Teachers.construct(self)
        RealWorldRelevance.construct(self)
        CapstoneProjects.construct(self)
        FinalScene.construct(self)
