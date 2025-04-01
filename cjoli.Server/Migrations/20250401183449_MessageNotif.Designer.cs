﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using cjoli.Server.Models;

#nullable disable

namespace cjoli.Server.Migrations
{
    [DbContext(typeof(CJoliContext))]
    [Migration("20250401183449_MessageNotif")]
    partial class MessageNotif
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            MySqlModelBuilderExtensions.AutoIncrementColumns(modelBuilder);

            modelBuilder.Entity("EventPosition", b =>
                {
                    b.Property<int>("EventsId")
                        .HasColumnType("int");

                    b.Property<int>("PositionsId")
                        .HasColumnType("int");

                    b.HasKey("EventsId", "PositionsId");

                    b.HasIndex("PositionsId");

                    b.ToTable("EventPosition");
                });

            modelBuilder.Entity("TeamTourney", b =>
                {
                    b.Property<int>("TeamsId")
                        .HasColumnType("int");

                    b.Property<int>("TourneysId")
                        .HasColumnType("int");

                    b.HasKey("TeamsId", "TourneysId");

                    b.HasIndex("TourneysId");

                    b.ToTable("TeamTourney");
                });

            modelBuilder.Entity("cjoli.Server.Models.Event", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int?>("PhaseId")
                        .HasColumnType("int");

                    b.Property<DateTime>("Time")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("PhaseId");

                    b.ToTable("Event");
                });

            modelBuilder.Entity("cjoli.Server.Models.Match", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("Done")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("ForfeitA")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("ForfeitB")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("Location")
                        .HasColumnType("longtext");

                    b.Property<int>("PenaltyA")
                        .HasColumnType("int");

                    b.Property<int>("PenaltyB")
                        .HasColumnType("int");

                    b.Property<int>("PositionAId")
                        .HasColumnType("int");

                    b.Property<int>("PositionBId")
                        .HasColumnType("int");

                    b.Property<int>("ScoreA")
                        .HasColumnType("int");

                    b.Property<int>("ScoreB")
                        .HasColumnType("int");

                    b.Property<bool>("Shot")
                        .HasColumnType("tinyint(1)");

                    b.Property<int?>("SquadId")
                        .HasColumnType("int");

                    b.Property<DateTime>("Time")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("PositionAId");

                    b.HasIndex("PositionBId");

                    b.HasIndex("SquadId");

                    b.ToTable("Match");
                });

            modelBuilder.Entity("cjoli.Server.Models.MatchEstimate", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("MatchId")
                        .HasColumnType("int");

                    b.Property<int>("ScoreA")
                        .HasColumnType("int");

                    b.Property<int>("ScoreB")
                        .HasColumnType("int");

                    b.Property<int?>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("MatchId");

                    b.HasIndex("UserId");

                    b.ToTable("MatchEstimate");
                });

            modelBuilder.Entity("cjoli.Server.Models.MatchResult", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("GoalAgainst")
                        .HasColumnType("int");

                    b.Property<int>("GoalDiff")
                        .HasColumnType("int");

                    b.Property<int>("GoalFor")
                        .HasColumnType("int");

                    b.Property<int>("Loss")
                        .HasColumnType("int");

                    b.Property<int>("MatchId")
                        .HasColumnType("int");

                    b.Property<int>("Neutral")
                        .HasColumnType("int");

                    b.Property<int>("ShutOut")
                        .HasColumnType("int");

                    b.Property<int>("TeamAgainstId")
                        .HasColumnType("int");

                    b.Property<int>("TeamId")
                        .HasColumnType("int");

                    b.Property<int>("Win")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("MatchId");

                    b.HasIndex("TeamAgainstId");

                    b.HasIndex("TeamId");

                    b.ToTable("MatchResult");
                });

            modelBuilder.Entity("cjoli.Server.Models.Message", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Body")
                        .HasColumnType("longtext");

                    b.Property<string>("Destination")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("From")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<bool>("IsPublished")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("MediaContentType")
                        .HasColumnType("longtext");

                    b.Property<string>("MediaName")
                        .HasColumnType("longtext");

                    b.Property<string>("MediaUrl")
                        .HasColumnType("longtext");

                    b.Property<string>("MessageId")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("MessageType")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("Time")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("To")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("TourneyId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("TourneyId");

                    b.ToTable("Messages");
                });

            modelBuilder.Entity("cjoli.Server.Models.ParentPosition", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("PositionId")
                        .HasColumnType("int");

                    b.Property<int>("SquadId")
                        .HasColumnType("int");

                    b.Property<int>("Value")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("PositionId")
                        .IsUnique();

                    b.HasIndex("SquadId");

                    b.ToTable("ParentPosition");
                });

            modelBuilder.Entity("cjoli.Server.Models.Phase", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("Time")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("TourneyId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("TourneyId");

                    b.ToTable("Phase");
                });

            modelBuilder.Entity("cjoli.Server.Models.Position", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.Property<int>("Penalty")
                        .HasColumnType("int");

                    b.Property<string>("Short")
                        .HasColumnType("longtext");

                    b.Property<int?>("SquadId")
                        .HasColumnType("int");

                    b.Property<int?>("TeamId")
                        .HasColumnType("int");

                    b.Property<int>("Value")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("SquadId");

                    b.HasIndex("TeamId");

                    b.ToTable("Position");
                });

            modelBuilder.Entity("cjoli.Server.Models.Rank", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.Property<int>("Order")
                        .HasColumnType("int");

                    b.Property<int>("SquadId")
                        .HasColumnType("int");

                    b.Property<int>("TourneyId")
                        .HasColumnType("int");

                    b.Property<int>("Value")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("SquadId");

                    b.HasIndex("TourneyId");

                    b.ToTable("Rank");
                });

            modelBuilder.Entity("cjoli.Server.Models.Squad", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("PhaseId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("PhaseId");

                    b.ToTable("Squad");
                });

            modelBuilder.Entity("cjoli.Server.Models.Team", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int?>("AliasId")
                        .HasColumnType("int");

                    b.Property<string>("FullName")
                        .HasColumnType("longtext");

                    b.Property<string>("Logo")
                        .HasColumnType("longtext");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("PrimaryColor")
                        .HasColumnType("longtext");

                    b.Property<string>("SecondaryColor")
                        .HasColumnType("longtext");

                    b.Property<string>("ShortName")
                        .HasColumnType("longtext");

                    b.Property<DateOnly?>("Youngest")
                        .HasColumnType("date");

                    b.HasKey("Id");

                    b.HasIndex("AliasId");

                    b.ToTable("Team");
                });

            modelBuilder.Entity("cjoli.Server.Models.TeamData", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Logo")
                        .HasColumnType("longtext");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.Property<int>("Penalty")
                        .HasColumnType("int");

                    b.Property<string>("PrimaryColor")
                        .HasColumnType("longtext");

                    b.Property<string>("SecondaryColor")
                        .HasColumnType("longtext");

                    b.Property<int>("TeamId")
                        .HasColumnType("int");

                    b.Property<int>("TourneyId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("TeamId");

                    b.HasIndex("TourneyId");

                    b.ToTable("TeamData");
                });

            modelBuilder.Entity("cjoli.Server.Models.Tourney", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Category")
                        .HasColumnType("longtext");

                    b.Property<DateTime?>("DisplayTime")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("EndTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Rule")
                        .HasColumnType("longtext");

                    b.Property<string>("Season")
                        .HasColumnType("longtext");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Uid")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("WhatsappNotif")
                        .HasColumnType("longtext");

                    b.Property<string>("WhatsappNumber")
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("Uid")
                        .IsUnique();

                    b.ToTable("Tourneys");
                });

            modelBuilder.Entity("cjoli.Server.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Login")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Role")
                        .HasColumnType("longtext");

                    b.Property<string>("Source")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("Login")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("cjoli.Server.Models.UserConfig", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<int?>("FavoriteTeamId")
                        .HasColumnType("int");

                    b.Property<bool>("IsAdmin")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("TourneyId")
                        .HasColumnType("int");

                    b.Property<bool>("UseCustomEstimate")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("FavoriteTeamId");

                    b.HasIndex("TourneyId");

                    b.HasIndex("UserId");

                    b.ToTable("UserConfig");
                });

            modelBuilder.Entity("cjoli.Server.Models.UserMatch", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("BetDiff")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("BetGoal")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("BetPerfect")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("BetScore")
                        .HasColumnType("int");

                    b.Property<bool>("BetWinner")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("ForfeitA")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("ForfeitB")
                        .HasColumnType("tinyint(1)");

                    b.Property<DateTime>("LogTime")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("MatchId")
                        .HasColumnType("int");

                    b.Property<int>("ScoreA")
                        .HasColumnType("int");

                    b.Property<int>("ScoreB")
                        .HasColumnType("int");

                    b.Property<int?>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("MatchId");

                    b.HasIndex("UserId");

                    b.ToTable("UserMatch");
                });

            modelBuilder.Entity("EventPosition", b =>
                {
                    b.HasOne("cjoli.Server.Models.Event", null)
                        .WithMany()
                        .HasForeignKey("EventsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Position", null)
                        .WithMany()
                        .HasForeignKey("PositionsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("TeamTourney", b =>
                {
                    b.HasOne("cjoli.Server.Models.Team", null)
                        .WithMany()
                        .HasForeignKey("TeamsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Tourney", null)
                        .WithMany()
                        .HasForeignKey("TourneysId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("cjoli.Server.Models.Event", b =>
                {
                    b.HasOne("cjoli.Server.Models.Phase", null)
                        .WithMany("Events")
                        .HasForeignKey("PhaseId");
                });

            modelBuilder.Entity("cjoli.Server.Models.Match", b =>
                {
                    b.HasOne("cjoli.Server.Models.Position", "PositionA")
                        .WithMany()
                        .HasForeignKey("PositionAId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Position", "PositionB")
                        .WithMany()
                        .HasForeignKey("PositionBId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Squad", "Squad")
                        .WithMany("Matches")
                        .HasForeignKey("SquadId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.Navigation("PositionA");

                    b.Navigation("PositionB");

                    b.Navigation("Squad");
                });

            modelBuilder.Entity("cjoli.Server.Models.MatchEstimate", b =>
                {
                    b.HasOne("cjoli.Server.Models.Match", "Match")
                        .WithMany("Estimates")
                        .HasForeignKey("MatchId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("Match");

                    b.Navigation("User");
                });

            modelBuilder.Entity("cjoli.Server.Models.MatchResult", b =>
                {
                    b.HasOne("cjoli.Server.Models.Match", "Match")
                        .WithMany("MatchResults")
                        .HasForeignKey("MatchId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Team", "TeamAgainst")
                        .WithMany()
                        .HasForeignKey("TeamAgainstId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Team", "Team")
                        .WithMany("MatchResults")
                        .HasForeignKey("TeamId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Match");

                    b.Navigation("Team");

                    b.Navigation("TeamAgainst");
                });

            modelBuilder.Entity("cjoli.Server.Models.Message", b =>
                {
                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany("Messages")
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Tourney");
                });

            modelBuilder.Entity("cjoli.Server.Models.ParentPosition", b =>
                {
                    b.HasOne("cjoli.Server.Models.Position", "Position")
                        .WithOne("ParentPosition")
                        .HasForeignKey("cjoli.Server.Models.ParentPosition", "PositionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Squad", "Squad")
                        .WithMany("ParentPositions")
                        .HasForeignKey("SquadId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Position");

                    b.Navigation("Squad");
                });

            modelBuilder.Entity("cjoli.Server.Models.Phase", b =>
                {
                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany("Phases")
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Tourney");
                });

            modelBuilder.Entity("cjoli.Server.Models.Position", b =>
                {
                    b.HasOne("cjoli.Server.Models.Squad", "Squad")
                        .WithMany("Positions")
                        .HasForeignKey("SquadId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("cjoli.Server.Models.Team", "Team")
                        .WithMany("Positions")
                        .HasForeignKey("TeamId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Squad");

                    b.Navigation("Team");
                });

            modelBuilder.Entity("cjoli.Server.Models.Rank", b =>
                {
                    b.HasOne("cjoli.Server.Models.Squad", "Squad")
                        .WithMany("Ranks")
                        .HasForeignKey("SquadId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany("Ranks")
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Squad");

                    b.Navigation("Tourney");
                });

            modelBuilder.Entity("cjoli.Server.Models.Squad", b =>
                {
                    b.HasOne("cjoli.Server.Models.Phase", "Phase")
                        .WithMany("Squads")
                        .HasForeignKey("PhaseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Phase");
                });

            modelBuilder.Entity("cjoli.Server.Models.Team", b =>
                {
                    b.HasOne("cjoli.Server.Models.Team", "Alias")
                        .WithMany("Children")
                        .HasForeignKey("AliasId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Alias");
                });

            modelBuilder.Entity("cjoli.Server.Models.TeamData", b =>
                {
                    b.HasOne("cjoli.Server.Models.Team", "Team")
                        .WithMany("TeamDatas")
                        .HasForeignKey("TeamId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany("TeamDatas")
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Team");

                    b.Navigation("Tourney");
                });

            modelBuilder.Entity("cjoli.Server.Models.UserConfig", b =>
                {
                    b.HasOne("cjoli.Server.Models.Team", "FavoriteTeam")
                        .WithMany("UserConfigs")
                        .HasForeignKey("FavoriteTeamId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany()
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.User", "User")
                        .WithMany("Configs")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("FavoriteTeam");

                    b.Navigation("Tourney");

                    b.Navigation("User");
                });

            modelBuilder.Entity("cjoli.Server.Models.UserMatch", b =>
                {
                    b.HasOne("cjoli.Server.Models.Match", "Match")
                        .WithMany("UserMatches")
                        .HasForeignKey("MatchId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("cjoli.Server.Models.User", "User")
                        .WithMany("UserMatches")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.Navigation("Match");

                    b.Navigation("User");
                });

            modelBuilder.Entity("cjoli.Server.Models.Match", b =>
                {
                    b.Navigation("Estimates");

                    b.Navigation("MatchResults");

                    b.Navigation("UserMatches");
                });

            modelBuilder.Entity("cjoli.Server.Models.Phase", b =>
                {
                    b.Navigation("Events");

                    b.Navigation("Squads");
                });

            modelBuilder.Entity("cjoli.Server.Models.Position", b =>
                {
                    b.Navigation("ParentPosition");
                });

            modelBuilder.Entity("cjoli.Server.Models.Squad", b =>
                {
                    b.Navigation("Matches");

                    b.Navigation("ParentPositions");

                    b.Navigation("Positions");

                    b.Navigation("Ranks");
                });

            modelBuilder.Entity("cjoli.Server.Models.Team", b =>
                {
                    b.Navigation("Children");

                    b.Navigation("MatchResults");

                    b.Navigation("Positions");

                    b.Navigation("TeamDatas");

                    b.Navigation("UserConfigs");
                });

            modelBuilder.Entity("cjoli.Server.Models.Tourney", b =>
                {
                    b.Navigation("Messages");

                    b.Navigation("Phases");

                    b.Navigation("Ranks");

                    b.Navigation("TeamDatas");
                });

            modelBuilder.Entity("cjoli.Server.Models.User", b =>
                {
                    b.Navigation("Configs");

                    b.Navigation("UserMatches");
                });
#pragma warning restore 612, 618
        }
    }
}
