﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using cjoli.Server.Datas;

#nullable disable

namespace cjoli.Server.Migrations
{
    [DbContext(typeof(CJoliContext))]
    [Migration("20240426195930_DeleteCascadeTeam")]
    partial class DeleteCascadeTeam
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            MySqlModelBuilderExtensions.AutoIncrementColumns(modelBuilder);

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

                    b.Property<int>("PositionAId")
                        .HasColumnType("int");

                    b.Property<int>("PositionBId")
                        .HasColumnType("int");

                    b.Property<int>("ScoreA")
                        .HasColumnType("int");

                    b.Property<int>("ScoreB")
                        .HasColumnType("int");

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

                    b.Property<int?>("TourneyId")
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

            modelBuilder.Entity("cjoli.Server.Models.Squad", b =>
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

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int?>("TourneyId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("TourneyId");

                    b.ToTable("Team");
                });

            modelBuilder.Entity("cjoli.Server.Models.Tourney", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("EndTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Uid")
                        .IsRequired()
                        .HasColumnType("varchar(255)");

                    b.HasKey("Id");

                    b.HasIndex("Uid")
                        .IsUnique();

                    b.ToTable("Tourneys");
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

            modelBuilder.Entity("cjoli.Server.Models.Phase", b =>
                {
                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany("Phases")
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade);

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

            modelBuilder.Entity("cjoli.Server.Models.Squad", b =>
                {
                    b.HasOne("cjoli.Server.Models.Phase", "Phase")
                        .WithMany("Squads")
                        .HasForeignKey("PhaseId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.Navigation("Phase");
                });

            modelBuilder.Entity("cjoli.Server.Models.Team", b =>
                {
                    b.HasOne("cjoli.Server.Models.Tourney", "Tourney")
                        .WithMany("Teams")
                        .HasForeignKey("TourneyId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.Navigation("Tourney");
                });

            modelBuilder.Entity("cjoli.Server.Models.Phase", b =>
                {
                    b.Navigation("Squads");
                });

            modelBuilder.Entity("cjoli.Server.Models.Squad", b =>
                {
                    b.Navigation("Matches");

                    b.Navigation("Positions");
                });

            modelBuilder.Entity("cjoli.Server.Models.Team", b =>
                {
                    b.Navigation("Positions");
                });

            modelBuilder.Entity("cjoli.Server.Models.Tourney", b =>
                {
                    b.Navigation("Phases");

                    b.Navigation("Teams");
                });
#pragma warning restore 612, 618
        }
    }
}
